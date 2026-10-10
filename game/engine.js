// プロトコル・スマッシュ ルールエンジン（v0.2 / 4人対戦）
// 画面・通信から切り離した純粋なロジック。ブラウザでも Node でも動く。
// 選択が必要な場面は chooser(state, playerIdx, kind, options, ctx) に問い合わせる。
(function (root) {
  'use strict';

  const ROUNDS = 8;
  const HAND_REFRESH = 5;
  const HAND_LIMIT = 6;
  const BASES_IN_PLAY = 4;
  const FACEDOWN_VALUE = 2;

  // ---------- 乱数（シード付き。ホストだけが使う） ----------
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rand) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ---------- データ ----------
  function indexData(data) {
    const cards = {}, bases = {}, objectives = {};
    data.cards.forEach(c => { cards[c.id] = c; });
    data.bases.forEach(b => { bases[b.id] = b; });
    data.objectives.forEach(o => { objectives[o.id] = o; });
    return { cards, bases, objectives, factions: data.factions, raw: data };
  }

  // ---------- 準備 ----------
  // factionsBySeat: [[f,f],[f,f],[f,f],[f,f]]
  function setup(D, factionsBySeat, seed) {
    const rand = rng(seed);
    let uid = 0;
    const players = factionsBySeat.map((fs, i) => {
      const deck = D.raw.cards.filter(c => fs.includes(c.faction))
        .map(c => ({ uid: uid++, cid: c.id, owner: i, faceUp: false }));
      shuffle(deck, rand);
      return {
        seat: i, factions: fs, deck, hand: [], trash: [], vp: 0, objective: null,
        stats: { first: 0, second: 0, fd: 0, fu: 0, ranked: 0, bigScore: 0, finalFirst: 0 },
      };
    });
    const objs = shuffle(D.raw.objectives.map(o => o.id), rand);
    players.forEach((p, i) => { p.objective = objs[i]; });
    const baseDeck = shuffle(D.raw.bases.map(b => b.id), rand);
    const state = {
      round: 1, startPlayer: 0, players, uid,
      bases: [], baseDeck, baseTrash: [],
      seed: Math.floor(rand() * 2 ** 31), log: [], over: false,
      breaks: 0,
    };
    for (let i = 0; i < BASES_IN_PLAY; i++) state.bases.push(newBaseSlot(state, rand));
    players.forEach(p => draw(state, p.seat, HAND_REFRESH, rand));
    return state;
  }

  function newBaseSlot(state, rand) {
    if (state.baseDeck.length === 0) {
      state.baseDeck = shuffle(state.baseTrash.splice(0), rand);
    }
    const id = state.baseDeck.shift();
    return { id, stacks: state.players.map(() => []) };
  }

  function draw(state, seat, n, rand) {
    const p = state.players[seat];
    for (let i = 0; i < n; i++) {
      if (p.deck.length === 0) {
        if (p.trash.length === 0) return;
        p.deck = shuffle(p.trash.splice(0), rand);
      }
      const c = p.deck.shift();
      c.faceUp = false;
      p.hand.push(c);
    }
  }

  // ---------- 値の計算 ----------
  function cardDef(D, c) { return D.cards[c.cid]; }

  function activeStatic(D, state, bi, seat, cid) {
    // その基地で seat が表向きの cid を持っているか（常時は覆われていても有効）
    return state.bases[bi].stacks[seat].some(c => c.faceUp && c.cid === cid);
  }

  function cardValue(D, state, bi, c) {
    const base = state.bases[bi];
    const bdef = D.bases[base.id];
    const seat = c.owner;
    if (!c.faceUp) {
      let v = FACEDOWN_VALUE;
      if (state.bases.some((_, j) => activeStatic(D, state, j, seat, 'n4'))) v = 3;
      if (bdef.id === 'b05') v = Math.max(v, 3);
      if (base.stacks.some((st, s) => s !== seat && st.some(x => x.faceUp && x.cid === 't6'))) v = 1;
      v -= base.stacks.reduce((a, st, s) => a + (s === seat ? 0 : st.filter(x => x.faceUp && x.cid === 't2').length), 0);
      return Math.max(0, v);
    }
    const def = cardDef(D, c);
    let v = def.value;
    const mine = base.stacks[seat];
    switch (def.id) {
      case 'd1': if (mine.some(x => x !== c && x.faceUp && cardDef(D, x).value >= 5)) v += 3; break;
      case 'd3': if (base.stacks.some((st, s) => s !== seat && st.some(x => !x.faceUp))) v += 2; break;
      case 'd6': v += 1; break;
      case 'z2': if (state.players[seat].trash.length >= 5) v += 2; break;
      case 'r1': if (mine.length >= 3) v += 3; break;
    }
    if (def.id !== 'r2' && activeStatic(D, state, bi, seat, 'r2')) v += 1;
    if (!(def.id === 'r5')) {
      for (let s = 0; s < base.stacks.length; s++) {
        if (s === seat) continue;
        const traps = base.stacks[s].filter(x => x.faceUp && x.cid === 't2').length;
        v -= traps;
      }
    }
    return Math.max(0, v);
  }

  function totals(D, state, bi) {
    return state.bases[bi].stacks.map(st => st.reduce((a, c) => a + cardValue(D, state, bi, c), 0));
  }
  function baseTotal(D, state, bi) { return totals(D, state, bi).reduce((a, b) => a + b, 0); }

  // 順位：カードのあるプレイヤーだけ。同点は上の順位を分け合う。
  function ranking(D, state, bi) {
    const t = totals(D, state, bi);
    const bdef = D.bases[state.bases[bi].id];
    const present = t.map((v, s) => ({ s, v, has: state.bases[bi].stacks[s].length > 0 })).filter(x => x.has);
    const reverse = bdef.id === 'b10';
    present.sort((a, b) => reverse ? a.v - b.v : b.v - a.v);
    const ranks = {};
    present.forEach((x, i) => {
      if (i > 0 && present[i - 1].v === x.v) ranks[x.s] = ranks[present[i - 1].s];
      else ranks[x.s] = i;
    });
    return ranks; // seat -> 0..3
  }

  // ---------- 判定ヘルパ ----------
  function immune(D, state, c, actor) {
    return c.owner !== actor && c.faceUp && c.cid === 'r5';
  }
  function fortress(D, state, bi) { return state.bases[bi].id === 'b12'; }

  function exposed(state, bi, seat) {
    const st = state.bases[bi].stacks[seat];
    return st.length ? st[st.length - 1] : null;
  }

  function findCard(state, uid) {
    for (let bi = 0; bi < state.bases.length; bi++) {
      const stacks = state.bases[bi].stacks;
      for (let s = 0; s < stacks.length; s++) {
        const i = stacks[s].findIndex(c => c.uid === uid);
        if (i >= 0) return { bi, s, i, card: stacks[s][i] };
      }
    }
    return null;
  }

  function removeFromBoard(state, uid) {
    const f = findCard(state, uid);
    if (!f) return null;
    state.bases[f.bi].stacks[f.s].splice(f.i, 1);
    return f;
  }

  function canFaceUp(D, state, bi, c) {
    const bdef = D.bases[state.bases[bi].id];
    if (!bdef.tags.includes(cardDef(D, c).faction)) return false;
    const blocked = state.bases[bi].stacks.some((st, s) => s !== c.owner && st.some(x => x.faceUp && x.cid === 't5'));
    return !blocked;
  }

  function log(state, msg) { state.log.push(`R${state.round}: ${msg}`); }

  // ---------- 効果 ----------
  // ctx: { D, rand, chooser }
  function returnToHand(state, f) {
    const c = f.card;
    state.bases[f.bi].stacks[f.s].splice(f.i, 1);
    c.faceUp = false;
    state.players[c.owner].hand.push(c);
  }

  function moveCard(state, f, toBi) {
    const c = f.card;
    state.bases[f.bi].stacks[f.s].splice(f.i, 1);
    state.bases[toBi].stacks[c.owner].push(c);
  }

  function otherBases(state, bi) {
    return state.bases.map((_, i) => i).filter(i => i !== bi);
  }

  function choose(ctx, state, seat, kind, options, info) {
    if (options.length === 0) return null;
    return ctx.chooser(state, seat, kind, options, info);
  }

  function discardOne(ctx, state, seat) {
    const p = state.players[seat];
    if (!p.hand.length) return;
    const pick = choose(ctx, state, seat, 'discard', p.hand.map(c => c.uid), {});
    const i = p.hand.findIndex(c => c.uid === pick);
    p.trash.push(p.hand.splice(i, 1)[0]);
  }

  function onReveal(ctx, state, c) {
    const { D, rand } = ctx;
    const f0 = findCard(state, c.uid);
    if (!f0) return;
    const bi = f0.bi, me = c.owner;
    const p = state.players[me];
    const othersExposedHere = pred => state.bases[bi].stacks
      .map((_, s) => s).filter(s => s !== me)
      .map(s => exposed(state, bi, s)).filter(x => x && !immune(D, state, x, me) && pred(x));

    switch (c.cid) {
      case 'n1': case 'w6': {
        if (c.cid === 'n1') draw(state, me, 1, rand);
        const opts = othersExposedHere(x => x.faceUp).map(x => x.uid);
        const t = choose(ctx, state, me, 'flipDown', opts, { bi });
        if (t != null) findCard(state, t).card.faceUp = false;
        break;
      }
      case 'r4': case 'a2': draw(state, me, 1, rand); break;
      case 'w1': draw(state, me, 2, rand); break;
      case 'w3': draw(state, me, 2, rand); discardOne(ctx, state, me); break;
      case 'n3': {
        if (fortress(state, state, bi)) break;
        const opts = othersExposedHere(x => cardValue(D, state, bi, x) <= 2).map(x => x.uid);
        const t = choose(ctx, state, me, 'bounce', opts, { bi });
        if (t != null) returnToHand(state, findCard(state, t));
        break;
      }
      case 'n5': {
        const yes = choose(ctx, state, me, 'smoke', [true, false], { bi });
        if (yes) { c.faceUp = false; draw(state, me, 2, rand); }
        break;
      }
      case 'n6': {
        const opts = [];
        state.bases.forEach((b, i) => b.stacks[me].forEach(x => { if (!x.faceUp && x !== c) opts.push(x.uid); }));
        const t = choose(ctx, state, me, 'flipUpOwn', opts, { bi });
        if (t != null) { const f = findCard(state, t); f.card.faceUp = true; p.stats.fu++; onReveal(ctx, state, f.card); }
        break;
      }
      case 'p1': {
        const opts = [];
        state.bases.forEach((b, i) => {
          if (fortress(state, state, i)) return;
          const x = exposed(state, i, me);
          if (x) otherBases(state, i).filter(j => !fortress(state, state, j)).forEach(j => opts.push([x.uid, j]));
        });
        const t = choose(ctx, state, me, 'move', opts, { bi });
        if (t) moveCard(state, findCard(state, t[0]), t[1]);
        break;
      }
      case 'p3': {
        const opts = [];
        otherBases(state, bi).forEach(j => {
          if (fortress(state, state, j)) return;
          state.bases[j].stacks.forEach((_, s) => {
            if (s === me) return;
            const x = exposed(state, j, s);
            if (x && !immune(D, state, x, me) && cardValue(D, state, j, x) <= 2) opts.push(x.uid);
          });
        });
        const t = choose(ctx, state, me, 'bounce', opts, { bi });
        if (t != null) returnToHand(state, findCard(state, t));
        break;
      }
      case 'p5': {
        if (fortress(state, state, bi)) break;
        const opts = [null].concat(otherBases(state, bi).filter(j => !fortress(state, state, j)));
        const t = choose(ctx, state, me, 'moveSelf', opts, { bi, uid: c.uid });
        if (t != null) moveCard(state, findCard(state, c.uid), t);
        break;
      }
      case 'n2': case 'w2': {
        if (!p.hand.length) break;
        const targets = c.cid === 'n2' ? [bi] : state.bases.map((_, i) => i);
        const opts = [null];
        p.hand.forEach(h => targets.forEach(j => opts.push([h.uid, j])));
        const t = choose(ctx, state, me, 'extraPlay', opts, { bi });
        if (t) {
          const i = p.hand.findIndex(h => h.uid === t[0]);
          const h = p.hand.splice(i, 1)[0];
          h.faceUp = false;
          state.bases[t[1]].stacks[me].push(h);
          p.stats.fd++;
        }
        break;
      }
      case 'r3': {
        if (p.deck.length === 0 && p.trash.length) p.deck = shuffle(p.trash.splice(0), rand);
        if (!p.deck.length) break;
        const top = p.deck.shift();
        if (D.cards[top.cid].value <= 3) { top.faceUp = false; state.bases[bi].stacks[me].push(top); p.stats.fd++; }
        else p.hand.push(top);
        break;
      }
      case 'z1': {
        const t = choose(ctx, state, me, 'recover', p.trash.map(x => x.uid), {});
        if (t != null) { const i = p.trash.findIndex(x => x.uid === t); p.hand.push(p.trash.splice(i, 1)[0]); }
        break;
      }
      case 'z3': case 'z4': {
        const lim = c.cid === 'z4' ? 3 : 2;
        const pool = p.trash.filter(x => D.cards[x.cid].value <= lim);
        const targets = [bi];
        const opts = [];
        pool.forEach(x => targets.forEach(j => opts.push([x.uid, j])));
        const t = choose(ctx, state, me, 'reanimate', opts, { bi });
        if (t) {
          const i = p.trash.findIndex(x => x.uid === t[0]);
          const x = p.trash.splice(i, 1)[0];
          x.faceUp = false; state.bases[t[1]].stacks[me].push(x); p.stats.fd++;
        }
        break;
      }
      case 'z6': case 'd6': discardOne(ctx, state, me); break;
      case 'd4': {
        state.bases[bi].stacks.forEach((_, s) => {
          if (s === me) return;
          const x = exposed(state, bi, s);
          if (x && x.faceUp && !immune(D, state, x, me)) x.faceUp = false;
        });
        break;
      }
      case 'a1': {
        if (fortress(state, state, bi)) break;
        const opts = othersExposedHere(() => true).map(x => x.uid);
        const t = choose(ctx, state, me, 'bounce', opts, { bi });
        if (t != null) returnToHand(state, findCard(state, t));
        break;
      }
      case 'a3': {
        const t = choose(ctx, state, me, 'terraform', state.bases.map((_, i) => i), { bi });
        const old = state.bases[t];
        state.baseTrash.push(old.id);
        const fresh = newBaseSlot(state, rand);
        old.id = fresh.id; // カードはそのまま
        draw(state, me, 1, rand);
        break;
      }
      case 'w5': {
        const opts = [null].concat(p.hand.map(h => h.uid));
        const t = choose(ctx, state, me, 'extraPlayUp', opts, { bi });
        if (t != null) {
          const i = p.hand.findIndex(h => h.uid === t);
          const h = p.hand.splice(i, 1)[0];
          h.faceUp = false;
          state.bases[bi].stacks[me].push(h);
          if (canFaceUp(D, state, bi, h)) { h.faceUp = true; p.stats.fu++; onReveal(ctx, state, h); }
          else p.stats.fd++;
        }
        break;
      }
      case 'a4': {
        const opts = [];
        state.bases.forEach((b, j) => {
          if (fortress(state, state, j)) return;
          b.stacks.forEach((_, s) => {
            if (s === me) return;
            const x = exposed(state, j, s);
            if (x && !immune(D, state, x, me) && cardValue(D, state, j, x) <= 4) opts.push(x.uid);
          });
        });
        const t = choose(ctx, state, me, 'bounce', opts, { bi });
        if (t != null) returnToHand(state, findCard(state, t));
        break;
      }
      case 'a6': {
        if (fortress(state, state, bi)) break;
        const opts = [];
        othersExposedHere(() => true).forEach(x =>
          otherBases(state, bi).filter(j => !fortress(state, state, j)).forEach(j => opts.push([x.uid, j])));
        const t = choose(ctx, state, me, 'moveOther', opts, { bi });
        if (t) moveCard(state, findCard(state, t[0]), t[1]);
        break;
      }
      case 't1': {
        draw(state, me, 1, rand);
        const others = state.players.filter(q => q.seat !== me);
        const top = Math.max(...others.map(q => q.vp));
        others.filter(q => q.vp === top).forEach(q => discardOne(ctx, state, q.seat));
        break;
      }
      case 't3': {
        const others = state.players.filter(q => q.seat !== me);
        const top = Math.max(...others.map(q => q.vp));
        const leaders = others.filter(q => q.vp === top).map(q => q.seat);
        const opts = [];
        state.bases.forEach((b, j) => {
          if (fortress(state, state, j)) return;
          leaders.forEach(s => { const x = exposed(state, j, s); if (x && !immune(D, state, x, me)) opts.push(x.uid); });
        });
        const t = choose(ctx, state, me, 'bounce', opts, { bi });
        if (t != null) returnToHand(state, findCard(state, t));
        break;
      }
    }
  }

  // ---------- 採点 ----------
  function scoreBase(ctx, state, bi, final) {
    const { D, rand } = ctx;
    const base = state.bases[bi];
    const bdef = D.bases[base.id];
    const ranks = ranking(D, state, bi);
    const order = [];
    for (let k = 0; k < state.players.length; k++) order.push((state.startPlayer + k) % state.players.length);
    const gained = {};
    Object.keys(ranks).forEach(s => {
      const r = ranks[s];
      const v = bdef.vp[r] || 0;
      const pl = state.players[s];
      pl.vp += v; gained[s] = v;
      pl.stats.ranked++;
      if (r === 0) pl.stats.first++;
      if (r === 1) pl.stats.second++;
      if (final && r === 0) pl.stats.finalFirst++;
    });
    const firsts = Object.keys(ranks).filter(s => ranks[s] === 0).map(Number);
    if (bdef.id === 'b06') firsts.forEach(s => draw(state, s, 2, rand));
    if (bdef.id === 'b07') firsts.forEach(s => {
      const p = state.players[s];
      const t = choose(ctx, state, s, 'recover', p.trash.map(x => x.uid), {});
      if (t != null) { const i = p.trash.findIndex(x => x.uid === t); p.hand.push(p.trash.splice(i, 1)[0]); }
    });
    if (bdef.id === 'b08') Object.keys(ranks).forEach(s => draw(state, Number(s), 1, rand));

    // 破壊時効果（手番順）
    const lastRank = Math.max(...Object.values(ranks));
    const kept = new Set();
    order.forEach(s => {
      base.stacks[s].slice().forEach(c => {
        if (!c.faceUp) return;
        const pl = state.players[s];
        switch (c.cid) {
          case 'p2': {
            if (final) break;
            const opts = [null].concat(otherBases(state, bi));
            const t = choose(ctx, state, s, 'moveSelf', opts, { bi, uid: c.uid, breaking: true });
            if (t != null) { const f = findCard(state, c.uid); moveCard(state, f, t); kept.add(c.uid); }
            break;
          }
          case 'p4': if (ranks[s] !== 0) { pl.vp += 1; gained[s] += 1; } break;
          case 'p6': if (ranks[s] === 0) { pl.vp += 1; gained[s] += 1; } break;
          case 'z5': for (let k = 0; k < 2; k++) {
            const t = choose(ctx, state, s, 'recover', pl.trash.map(x => x.uid), {});
            if (t != null) { const i = pl.trash.findIndex(x => x.uid === t); pl.hand.push(pl.trash.splice(i, 1)[0]); }
          } break;
          case 'd2': draw(state, s, 2, rand); break;
          case 'a5': { const f = findCard(state, c.uid); if (f) { returnToHand(state, f); kept.add(c.uid); } break; }
          case 't4': if (ranks[s] === lastRank && Object.keys(ranks).length > 1) { const d = (bdef.vp[0] || 0) - (bdef.vp[ranks[s]] || 0); pl.vp += d; gained[s] += d; } break;
        }
      });
    });
    Object.keys(gained).forEach(s => {
      const pl = state.players[s];
      pl.stats.bigScore = Math.max(pl.stats.bigScore, gained[s]);
    });
    // 残りを捨て札へ
    base.stacks.forEach((st, s) => {
      st.forEach(c => { c.faceUp = false; state.players[s].trash.push(c); });
      base.stacks[s] = [];
    });
    state.breaks++;
    log(state, `${bdef.name} 採点: ` + Object.keys(ranks).map(s => `P${+s + 1}=${ranks[s] + 1}位(+${gained[s]})`).join(' '));
    if (!final) {
      state.baseTrash.push(base.id);
      const fresh = newBaseSlot(state, rand);
      base.id = fresh.id;
    }
  }

  // ---------- ラウンド進行 ----------
  // actions[seat] = { type:'play', uid, bi } | { type:'refresh' }
  // reveal時の表/裏は chooser(kind='faceUp') に聞く。
  function playRound(ctx, state, actions) {
    const { D, rand } = ctx;
    const n = state.players.length;
    // 1. 全員同時に伏せて置く
    actions.forEach((a, s) => {
      if (a.type !== 'play') return;
      const p = state.players[s];
      const i = p.hand.findIndex(c => c.uid === a.uid);
      if (i < 0) { actions[s] = { type: 'refresh' }; return; }
      const c = p.hand.splice(i, 1)[0];
      c.faceUp = false;
      state.bases[a.bi].stacks[s].push(c);
    });
    // 2. スタートプレイヤーから順に公開
    for (let k = 0; k < n; k++) {
      const s = (state.startPlayer + k) % n;
      const a = actions[s];
      const p = state.players[s];
      if (a.type === 'refresh') {
        const target = state.bases.some((b, i) => activeStatic(D, state, i, s, 'w4')) ? 6 : HAND_REFRESH;
        if (p.hand.length < HAND_REFRESH) draw(state, s, HAND_REFRESH - p.hand.length, rand);
        if (target > HAND_REFRESH && p.hand.length) {
          const opts = [null];
          p.hand.forEach(h => state.bases.forEach((_, j) => opts.push([h.uid, j])));
          const t = choose(ctx, state, s, 'extraPlay', opts, {});
          if (t) {
            const i = p.hand.findIndex(h => h.uid === t[0]);
            const h = p.hand.splice(i, 1)[0];
            h.faceUp = false; state.bases[t[1]].stacks[s].push(h); p.stats.fd++;
          }
        }
        log(state, `P${s + 1} リフレッシュ`);
        continue;
      }
      const f = findCard(state, a.uid);
      if (!f) { log(state, `P${s + 1} のカードは公開前に戻された`); continue; }
      let up = false;
      if (canFaceUp(D, state, f.bi, f.card)) up = choose(ctx, state, s, 'faceUp', [true, false], { bi: f.bi, uid: a.uid });
      if (up) {
        f.card.faceUp = true; p.stats.fu++;
        log(state, `P${s + 1} ${D.cards[f.card.cid].name} を表で公開 @${D.bases[state.bases[f.bi].id].name}`);
        onReveal(ctx, state, f.card);
      } else {
        p.stats.fd++;
        log(state, `P${s + 1} 裏向きで公開 @${D.bases[state.bases[f.bi].id].name}`);
      }
    }
    // 3. 破壊チェック
    const final = state.round >= ROUNDS;
    for (let bi = 0; bi < state.bases.length; bi++) {
      const bdef = D.bases[state.bases[bi].id];
      if (baseTotal(D, state, bi) >= bdef.bp) scoreBase(ctx, state, bi, false);
    }
    // 4. 手札上限
    state.players.forEach(p => { while (p.hand.length > HAND_LIMIT) discardOne(ctx, state, p.seat); });
    // 5. 終了 or 次ラウンド
    if (final) {
      for (let bi = 0; bi < state.bases.length; bi++) {
        if (state.bases[bi].stacks.some(st => st.length)) scoreBase(ctx, state, bi, true);
      }
      finishGame(ctx, state);
    } else {
      state.round++;
      state.startPlayer = (state.startPlayer + 1) % n;
    }
  }

  function objectiveMet(state, p) {
    const st = p.stats;
    switch (p.objective) {
      case 'o1': return st.first >= 4;
      case 'o2': return st.fd >= 5;
      case 'o3': return st.fu >= 4;
      case 'o4': return st.ranked >= 7;
      case 'o5': return st.bigScore >= 7;
      case 'o6': return st.second >= 3;
      case 'o7': return p.hand.length >= 5;
      case 'o8': return st.finalFirst >= 2;
    }
    return false;
  }

  function finishGame(ctx, state) {
    state.players.forEach(p => {
      p.objectiveMet = objectiveMet(state, p);
      if (p.objectiveMet) p.vp += ctx.D.objectives[p.objective].vp;
    });
    const top = Math.max(...state.players.map(p => p.vp));
    state.winners = state.players.filter(p => p.vp === top).map(p => p.seat);
    state.over = true;
  }

  // ---------- 見える情報だけに変換（オンライン用） ----------
  function viewFor(state, seat) {
    const v = JSON.parse(JSON.stringify(state));
    v.players.forEach(p => {
      p.deckCount = p.deck.length; p.deck = [];
      if (p.seat !== seat) { p.handCount = p.hand.length; p.hand = []; p.objective = null; }
    });
    v.bases.forEach(b => b.stacks.forEach((st, s) => st.forEach(c => {
      if (!c.faceUp && s !== seat) c.cid = null;
    })));
    v.baseDeck = []; v.seed = null;
    return v;
  }

  const api = {
    ROUNDS, HAND_REFRESH, HAND_LIMIT, BASES_IN_PLAY,
    rng, shuffle, indexData, setup, playRound, viewFor,
    cardValue, totals, baseTotal, ranking, canFaceUp, findCard, exposed, onReveal, draw,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Engine = api;
})(typeof window !== 'undefined' ? window : globalThis);
