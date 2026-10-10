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
  const MAX_PLAYS = 2;
  // リフレッシュ：誰も公開する前にまとめて行う。手札 0 枚でリフレッシュした人は、引いたあと 1 枚を裏向きで出してよい
  const REFRESH_PLAY = 2;
  const REFRESH_EARLY = true;

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
  // opts.maxPlays: 1 ラウンドに伏せられる枚数（試験用。既定は MAX_PLAYS）。v0.2 相当は maxPlays: 1
  // opts.bpScale: 基地の耐久値の倍率（試験用。既定 1）
  // opts.refreshPlay: リフレッシュで引いたあと 1 枚を裏向きで出してよいか（0 = 出せない、1 = いつでも、2 = 手札 0 枚でリフレッシュしたときだけ。既定 2）
  // opts.refreshEarly: リフレッシュを誰も公開する前に行うか（既定 true）
  function setup(D, factionsBySeat, seed, opts) {
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
      rules: { maxPlays: (opts && opts.maxPlays) || MAX_PLAYS, bpScale: (opts && opts.bpScale) || 1, refreshPlay: opts && opts.refreshPlay != null ? opts.refreshPlay : REFRESH_PLAY,
        refreshEarly: opts && opts.refreshEarly != null ? !!opts.refreshEarly : REFRESH_EARLY },
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

  // 基地の耐久値（試験用の倍率を反映）
  function baseBP(D, state, bi) {
    const bp = D.bases[state.bases[bi].id].bp;
    const k = state.rules ? state.rules.bpScale : 1;
    return k === 1 ? bp : Math.round(bp * k);
  }

  // その席が 1 ラウンドに伏せられる枚数（ルールの枚数。表向きの知識の泉があれば +1）
  function maxPlaysFor(D, state, seat) {
    const base = state.rules ? state.rules.maxPlays : MAX_PLAYS;
    return base + (state.bases.some((_, i) => activeStatic(D, state, i, seat, 'w4')) ? 1 : 0);
  }

  // actions[seat] の伏せるカード一覧。{ uid, bi } 1 つの形と { plays: [...] } の形の両方を受け付ける
  function playsOf(a) {
    if (!a || a.type !== 'play') return [];
    return a.plays ? a.plays : [{ uid: a.uid, bi: a.bi }];
  }

  function totals(D, state, bi) {
    return state.bases[bi].stacks.map(st => st.reduce((a, c) => a + cardValue(D, state, bi, c), 0));
  }
  function baseTotal(D, state, bi) { return totals(D, state, bi).reduce((a, b) => a + b, 0); }

  // 順位：カードのあるプレイヤーだけ。同点は上の順位を分け合う。
  function ranking(D, state, bi) {
    const t = totals(D, state, bi);
    const present = t.map((v, s) => ({ s, v, has: state.bases[bi].stacks[s].length > 0 })).filter(x => x.has);
    present.sort((a, b) => b.v - a.v);
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

  // 表向きにできない理由。できるなら null。
  // { code: 'faction', tags } 派閥が基地の表向き可に含まれない / { code: 'barrier', seat } 他人の結界
  function faceUpBlock(D, state, bi, c) {
    const bdef = D.bases[state.bases[bi].id];
    if (!bdef.tags.includes(cardDef(D, c).faction)) return { code: 'faction', tags: bdef.tags.slice() };
    const s = state.bases[bi].stacks.findIndex((st, s) => s !== c.owner && st.some(x => x.faceUp && x.cid === 't5'));
    return s >= 0 ? { code: 'barrier', seat: s } : null;
  }
  function canFaceUp(D, state, bi, c) { return faceUpBlock(D, state, bi, c) === null; }

  // meta は画面の再生用（どのカード・どの基地の出来事か）。state._trace があるときだけ、その時点の盤面ごと記録する
  function log(state, msg, meta) {
    state.log.push(`R${state.round}: ${msg}`);
    if (!state._trace) return;
    const trace = state._trace;
    delete state._trace;
    trace.push({ line: state.log.length - 1, meta: meta || null, state: clone(state) });
    state._trace = trace;
  }
  function event(state, e) { (state.events || (state.events = [])).push(Object.assign({ round: state.round }, e)); }
  // ログ用のカード名。裏向きは中身を出さない
  function nameOf(D, c) { return c.faceUp ? `「${D.cards[c.cid].name}」` : '裏向きカード'; }
  function baseName(D, state, bi) { return D.bases[state.bases[bi].id].name; }

  // ---------- 効果 ----------
  // ctx: { D, rand, chooser }
  function returnToHand(D, state, f) {
    const c = f.card;
    log(state, `P${c.owner + 1} の${nameOf(D, c)}が手札に戻った @${baseName(D, state, f.bi)}`, { kind: 'bounce', uid: c.uid, bi: f.bi });
    state.bases[f.bi].stacks[f.s].splice(f.i, 1);
    c.faceUp = false;
    delete c.pending;
    state.players[c.owner].hand.push(c);
  }

  function moveCard(D, state, f, toBi) {
    const c = f.card;
    const msg = `P${c.owner + 1} の${nameOf(D, c)}が移動 ${baseName(D, state, f.bi)}→${baseName(D, state, toBi)}`;
    state.bases[f.bi].stacks[f.s].splice(f.i, 1);
    state.bases[toBi].stacks[c.owner].push(c);
    log(state, msg, { kind: 'move', uid: c.uid, bi: toBi });
  }

  function flipDown(D, state, c) {
    const f = findCard(state, c.uid);
    c.faceUp = false;
    log(state, `P${c.owner + 1} の「${D.cards[c.cid].name}」が裏向きになった @${baseName(D, state, f.bi)}`, { kind: 'flip', uid: c.uid, bi: f.bi });
  }

  function drawLog(state, seat, n, rand) {
    const before = state.players[seat].hand.length;
    draw(state, seat, n, rand);
    const got = state.players[seat].hand.length - before;
    if (got) log(state, `P${seat + 1} が${got}枚引いた`);
  }

  function recoverOne(ctx, state, seat) {
    const p = state.players[seat];
    const t = choose(ctx, state, seat, 'recover', p.trash.map(x => x.uid), {});
    if (t == null) return;
    const i = p.trash.findIndex(x => x.uid === t);
    const x = p.trash.splice(i, 1)[0];
    p.hand.push(x);
    log(state, `P${seat + 1} が捨て札から「${ctx.D.cards[x.cid].name}」を手札に加えた`);
  }

  function playFromHandDown(D, state, seat, uid, bi) {
    const p = state.players[seat];
    const i = p.hand.findIndex(h => h.uid === uid);
    const h = p.hand.splice(i, 1)[0];
    h.faceUp = false;
    state.bases[bi].stacks[seat].push(h);
    log(state, `P${seat + 1} が手札1枚を裏向きで追加で出した @${baseName(D, state, bi)}`);
    return h;
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
    const c = p.hand.splice(i, 1)[0];
    p.trash.push(c);
    log(state, `P${seat + 1} が「${ctx.D.cards[c.cid].name}」を捨てた`);
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
        if (c.cid === 'n1') drawLog(state, me, 1, rand);
        const opts = othersExposedHere(x => x.faceUp).map(x => x.uid);
        const t = choose(ctx, state, me, 'flipDown', opts, { bi });
        if (t != null) flipDown(D, state, findCard(state, t).card);
        break;
      }
      case 'r4': case 'a2': drawLog(state, me, 1, rand); break;
      case 'w1': drawLog(state, me, 2, rand); break;
      case 'w3': drawLog(state, me, 2, rand); discardOne(ctx, state, me); break;
      case 'n3': {
        if (fortress(state, state, bi)) break;
        const opts = othersExposedHere(x => cardValue(D, state, bi, x) <= 2).map(x => x.uid);
        const t = choose(ctx, state, me, 'bounce', opts, { bi });
        if (t != null) returnToHand(D, state, findCard(state, t));
        break;
      }
      case 'n5': {
        const yes = choose(ctx, state, me, 'smoke', [true, false], { bi });
        if (yes) { flipDown(D, state, c); drawLog(state, me, 2, rand); }
        break;
      }
      case 'n6': {
        const opts = [];
        state.bases.forEach((b, i) => b.stacks[me].forEach(x => { if (!x.faceUp && x !== c) opts.push(x.uid); }));
        const t = choose(ctx, state, me, 'flipUpOwn', opts, { bi });
        if (t != null) {
          const f = findCard(state, t); f.card.faceUp = true; p.stats.fu++;
          delete f.card.pending; // このラウンドに伏せたカードなら、ここで公開済みになる
          log(state, `P${me + 1} の「${D.cards[f.card.cid].name}」が表向きになった @${baseName(D, state, f.bi)}`);
          onReveal(ctx, state, f.card);
        }
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
        if (t) moveCard(D, state, findCard(state, t[0]), t[1]);
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
        if (t != null) returnToHand(D, state, findCard(state, t));
        break;
      }
      case 'p5': {
        if (fortress(state, state, bi)) break;
        const opts = [null].concat(otherBases(state, bi).filter(j => !fortress(state, state, j)));
        const t = choose(ctx, state, me, 'moveSelf', opts, { bi, uid: c.uid });
        if (t != null) moveCard(D, state, findCard(state, c.uid), t);
        break;
      }
      case 'n2': case 'w2': {
        if (!p.hand.length) break;
        const targets = c.cid === 'n2' ? [bi] : state.bases.map((_, i) => i);
        const opts = [null];
        p.hand.forEach(h => targets.forEach(j => opts.push([h.uid, j])));
        const t = choose(ctx, state, me, 'extraPlay', opts, { bi });
        if (t) { playFromHandDown(D, state, me, t[0], t[1]); p.stats.fd++; }
        break;
      }
      case 'r3': {
        if (p.deck.length === 0 && p.trash.length) p.deck = shuffle(p.trash.splice(0), rand);
        if (!p.deck.length) break;
        const top = p.deck.shift();
        log(state, `P${me + 1} が山札の一番上「${D.cards[top.cid].name}」を公開した`);
        if (D.cards[top.cid].value <= 3) { top.faceUp = false; state.bases[bi].stacks[me].push(top); p.stats.fd++; }
        else p.hand.push(top);
        break;
      }
      case 'z1': {
        recoverOne(ctx, state, me);
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
          log(state, `P${me + 1} が捨て札の「${D.cards[x.cid].name}」を裏向きで出した @${baseName(D, state, t[1])}`);
        }
        break;
      }
      case 'z6': case 'd6': discardOne(ctx, state, me); break;
      case 'd4': {
        state.bases[bi].stacks.forEach((_, s) => {
          if (s === me) return;
          const x = exposed(state, bi, s);
          if (x && x.faceUp && !immune(D, state, x, me)) flipDown(D, state, x);
        });
        break;
      }
      case 'a1': {
        if (fortress(state, state, bi)) break;
        const opts = othersExposedHere(() => true).map(x => x.uid);
        const t = choose(ctx, state, me, 'bounce', opts, { bi });
        if (t != null) returnToHand(D, state, findCard(state, t));
        break;
      }
      case 'a3': {
        const t = choose(ctx, state, me, 'terraform', state.bases.map((_, i) => i), { bi });
        const old = state.bases[t];
        const oldName = D.bases[old.id].name;
        state.baseTrash.push(old.id);
        const fresh = newBaseSlot(state, rand);
        old.id = fresh.id; // カードはそのまま
        log(state, `P${me + 1} が基地「${oldName}」を「${D.bases[old.id].name}」に入れ替えた`);
        drawLog(state, me, 1, rand);
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
          if (canFaceUp(D, state, bi, h)) {
            h.faceUp = true; p.stats.fu++;
            log(state, `P${me + 1} が手札の「${D.cards[h.cid].name}」を表向きで追加で出した @${baseName(D, state, bi)}`);
            onReveal(ctx, state, h);
          } else {
            p.stats.fd++;
            log(state, `P${me + 1} が手札1枚を裏向きで追加で出した @${baseName(D, state, bi)}`);
          }
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
        if (t != null) returnToHand(D, state, findCard(state, t));
        break;
      }
      case 'a6': {
        if (fortress(state, state, bi)) break;
        const opts = [];
        othersExposedHere(() => true).forEach(x =>
          otherBases(state, bi).filter(j => !fortress(state, state, j)).forEach(j => opts.push([x.uid, j])));
        const t = choose(ctx, state, me, 'moveOther', opts, { bi });
        if (t) moveCard(D, state, findCard(state, t[0]), t[1]);
        break;
      }
      case 't1': {
        drawLog(state, me, 1, rand);
        const others = state.players.filter(q => q.seat !== me);
        const top = Math.max(...others.map(q => q.vp));
        others.filter(q => q.vp === top).forEach(q => {
          const x = exposed(state, bi, q.seat);
          if (x && x.faceUp && !immune(D, state, x, me)) flipDown(D, state, x);
        });
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
        if (t != null) returnToHand(D, state, findCard(state, t));
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
    log(state, `${bdef.name} 採点${final ? '（最終）' : ''}: ` + Object.keys(ranks).map(s => `P${+s + 1}=${ranks[s] + 1}位(+${gained[s]})`).join(' '),
      { kind: 'score', bi, baseId: base.id, final });
    if (bdef.id === 'b06') firsts.forEach(s => drawLog(state, s, 2, rand));
    if (bdef.id === 'b07') firsts.forEach(s => recoverOne(ctx, state, s));
    if (bdef.id === 'b08') Object.keys(ranks).forEach(s => drawLog(state, Number(s), 1, rand));

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
            if (t != null) { const f = findCard(state, c.uid); moveCard(D, state, f, t); kept.add(c.uid); }
            break;
          }
          case 'p4': if (ranks[s] !== 0) { pl.vp += 1; gained[s] += 1; log(state, `P${s + 1} 略奪者で+1VP`); } break;
          case 'p6': if (ranks[s] === 0) { pl.vp += 1; gained[s] += 1; log(state, `P${s + 1} 船長で+1VP`); } break;
          case 'z5': for (let k = 0; k < 2; k++) recoverOne(ctx, state, s); break;
          case 'd2': drawLog(state, s, 2, rand); break;
          case 'a5': { const f = findCard(state, c.uid); if (f) { returnToHand(D, state, f); kept.add(c.uid); } break; }
          case 't4': if (ranks[s] === lastRank && Object.keys(ranks).length > 1) { const d = (bdef.vp[0] || 0) - (bdef.vp[ranks[s]] || 0); pl.vp += d; gained[s] += d; log(state, `P${s + 1} 大逆転で+${d}VP`); } break;
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
    const rankList = {};
    Object.keys(ranks).forEach(k => { rankList[k] = ranks[k]; });
    event(state, { type: 'score', bi, baseId: base.id, ranks: rankList, gained: Object.assign({}, gained), final });
    if (!final) {
      state.baseTrash.push(base.id);
      const fresh = newBaseSlot(state, rand);
      base.id = fresh.id;
      log(state, `新しい基地「${D.bases[base.id].name}」が出た`);
    }
  }

  // 伏せたカード 1 枚を公開する（表/裏は持ち主に聞く）
  function revealOne(ctx, state, s, uid) {
    const { D } = ctx;
    const p = state.players[s];
    const f = findCard(state, uid);
    if (!f) { log(state, `P${s + 1} のカードは公開前に戻された`, { kind: 'gone', seat: s }); return; }
    // 効果ですでに公開済み（上忍で表にされた）、または手札に戻って出し直されたカードは公開しない
    if (!f.card.pending) return;
    delete f.card.pending;
    let up = false;
    if (canFaceUp(D, state, f.bi, f.card)) up = choose(ctx, state, s, 'faceUp', [true, false], { bi: f.bi, uid });
    if (up) {
      f.card.faceUp = true; p.stats.fu++;
      log(state, `P${s + 1} ${D.cards[f.card.cid].name} を表で公開 @${D.bases[state.bases[f.bi].id].name}`, { kind: 'reveal', seat: s, uid, bi: f.bi, up: true });
      onReveal(ctx, state, f.card);
    } else {
      p.stats.fd++;
      log(state, `P${s + 1} 裏向きで公開 @${D.bases[state.bases[f.bi].id].name}`, { kind: 'reveal', seat: s, uid, bi: f.bi, up: false });
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
      const seen = new Set();
      const plays = playsOf(a).slice(0, maxPlaysFor(D, state, s)).filter(pl => {
        const ok = !seen.has(pl.uid) && p.hand.some(c => c.uid === pl.uid) && pl.bi >= 0 && pl.bi < state.bases.length;
        seen.add(pl.uid);
        return ok;
      });
      if (!plays.length) { actions[s] = { type: 'refresh' }; return; }
      plays.forEach(pl => {
        const i = p.hand.findIndex(c => c.uid === pl.uid);
        const c = p.hand.splice(i, 1)[0];
        c.faceUp = false;
        c.pending = true; // このラウンドに公開を待っている印（手札に戻されたら消える）
        state.bases[pl.bi].stacks[s].push(c);
      });
      actions[s] = { type: 'play', plays };
    });
    // 2. リフレッシュ（refreshEarly なら、誰も公開する前にまとめて行う）と、スタートプレイヤーから順に公開
    const doRefresh = s => {
      const p = state.players[s];
      log(state, `P${s + 1} リフレッシュ`, { kind: 'refresh', seat: s });
      const wasEmpty = p.hand.length === 0;
      if (p.hand.length < HAND_REFRESH) drawLog(state, s, HAND_REFRESH - p.hand.length, rand);
      const rp = state.rules ? state.rules.refreshPlay : 0;
      if ((rp === 1 || (rp === 2 && wasEmpty)) && p.hand.length) {
        const opts = [null];
        p.hand.forEach(h => state.bases.forEach((_, j) => opts.push([h.uid, j])));
        const t = choose(ctx, state, s, 'extraPlay', opts, {});
        if (t) { playFromHandDown(D, state, s, t[0], t[1]); p.stats.fd++; }
      }
    };
    const early = !!(state.rules && state.rules.refreshEarly);
    if (early) {
      for (let k = 0; k < n; k++) {
        const s = (state.startPlayer + k) % n;
        if (actions[s].type === 'refresh') doRefresh(s);
      }
    }
    for (let k = 0; k < n; k++) {
      const s = (state.startPlayer + k) % n;
      const a = actions[s];
      if (a.type === 'refresh') { if (!early) doRefresh(s); continue; }
      a.plays.forEach(pl => revealOne(ctx, state, s, pl.uid));
    }
    // 3. 破壊チェック
    const final = state.round >= ROUNDS;
    for (let bi = 0; bi < state.bases.length; bi++) {
      if (baseTotal(D, state, bi) >= baseBP(D, state, bi)) scoreBase(ctx, state, bi, false);
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

  // ---------- 選択待ちで止まれるラウンド実行（画面用） ----------
  // before: ラウンド開始時の状態（変更しない）。actions: 各席の行動。answers: これまでの選択の答え（出てきた順）。
  // auto(state, seat, kind, options, info): ボットの席なら答えを返し、人間の席なら undefined を返す。
  // 乱数はラウンドごとにシードから作り直すので、同じ before・actions・answers からは必ず同じ結果になる。
  // 未回答の選択に来たら、その直前の状態と pending { seat, kind, options, info } を返して止まる。
  // 答えを answers に足してもう一度呼べば続きから進む（最初から再実行して同じ所まで来る）。
  // opts.trace が true なら、ログ 1 行ごとの盤面 frames [{ line, meta, state }] も返す（公開の再生用）。
  function roundRand(state) { return rng((state.seed + Math.imul(state.round, 0x9E3779B1)) >>> 0); }

  function resolveRound(D, before, actions, answers, auto, opts) {
    const state = clone(before);
    const frames = [];
    if (opts && opts.trace) state._trace = frames;
    const untrace = st => { const c = clone(Object.assign({}, st, { _trace: undefined })); delete c._trace; return c; };
    const given = answers.slice();
    const PAUSE = {};
    let k = 0, pending = null, paused = null;
    const chooser = (st, seat, kind, options, info) => {
      if (k < given.length) {
        const a = given[k++];
        if (!options.some(o => JSON.stringify(o) === JSON.stringify(a))) throw new Error(`選択の再現に失敗しました（${kind}）`);
        return a;
      }
      const a = auto ? auto(st, seat, kind, options, info || {}) : undefined;
      if (a !== undefined) { given.push(a); k++; return a; }
      pending = { seat, kind, options, info: info || {} };
      paused = untrace(st);
      throw PAUSE;
    };
    try {
      playRound({ D, rand: roundRand(before), chooser }, state, clone(actions));
    } catch (e) {
      if (e !== PAUSE) throw e;
      return { state: paused, answers: given, pending, frames };
    }
    delete state._trace;
    return { state, answers: given, pending: null, frames };
  }

  // いま採点したら各席が得る VP（基地の順位 VP のみ。破壊時効果は含めない）
  function projectedVP(D, state, bi) {
    const ranks = ranking(D, state, bi);
    const vp = D.bases[state.bases[bi].id].vp;
    const out = {};
    Object.keys(ranks).forEach(s => { out[s] = vp[ranks[s]] || 0; });
    return out;
  }

  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  function objectiveMet(state, p) {
    const st = p.stats;
    switch (p.objective) {
      case 'o1': return st.first >= 4;
      case 'o2': return st.fd >= 9;
      case 'o3': return st.fu >= 6;
      case 'o4': return st.ranked >= 9;
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
    cardValue, totals, baseTotal, ranking, canFaceUp, faceUpBlock, findCard, exposed, onReveal, draw,
    resolveRound, projectedVP, objectiveMet, baseBP, playsOf, maxPlaysFor, MAX_PLAYS,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Engine = api;
})(typeof window !== 'undefined' ? window : globalThis);
