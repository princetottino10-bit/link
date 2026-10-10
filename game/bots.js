// プロトコル・スマッシュ ボット（シミュレーターとホットシート版で共用）
// createBots(Engine, D) で、評価関数・選択関数・行動選択をまとめて返す。
(function (root) {
  'use strict';

  function createBots(E, D) {
    const clone = s => JSON.parse(JSON.stringify(s));
    const SECOND_PLAY_MARGIN = 0;

    // ---------- 評価関数 ----------
    function H(state, me) {
      const p = state.players[me];
      let h = p.vp + 0.35 * Math.min(p.hand.length, 6);
      const progressFloor = state.round / E.ROUNDS; // 最終ラウンドに全基地が採点されるので、終盤ほど確実
      state.bases.forEach((b, bi) => {
        if (!b.stacks[me].length) return;
        const bdef = D.bases[b.id];
        const prog = Math.max(Math.min(1, E.baseTotal(D, state, bi) / E.baseBP(D, state, bi)), progressFloor);
        const r = E.ranking(D, state, bi)[me];
        h += Math.pow(prog, 1.3) * (bdef.vp[r] || 0);
      });
      return h;
    }

    function strongestTarget(state, opts, valueOf) {
      // 得点の高い持ち主の、値の大きいカードを狙う
      let best = null, bv = -1e9;
      opts.forEach(o => {
        const uid = Array.isArray(o) ? o[0] : o;
        const f = E.findCard(state, uid);
        if (!f) return;
        const v = valueOf(f) + 0.5 * state.players[f.card.owner].vp;
        if (v > bv) { bv = v; best = o; }
      });
      return best;
    }

    function makeGreedyChooser(rand) {
      return function chooser(state, seat, kind, options, info) {
        const pick = () => options[Math.floor(rand() * options.length)];
        const p = state.players[seat];
        switch (kind) {
          case 'faceUp': return true; // 実際の判断は行動選択時に済ませている（下で上書き）
          case 'discard': {
            let best = options[0], bv = 1e9;
            options.forEach(uid => { const c = p.hand.find(x => x.uid === uid); const v = D.cards[c.cid].value; if (v < bv) { bv = v; best = uid; } });
            return best;
          }
          case 'recover': {
            let best = options[0], bv = -1;
            options.forEach(uid => { const c = p.trash.find(x => x.uid === uid); const v = D.cards[c.cid].value; if (v > bv) { bv = v; best = uid; } });
            return best;
          }
          case 'smoke': return p.hand.length <= 3;
          case 'flipDown': case 'bounce': case 'reveal':
            return strongestTarget(state, options, f => E.cardValue(D, state, f.bi, f.card) * (kind === 'reveal' ? -1 : 1));
          case 'flipUpOwn': return pick();
          case 'terraform': {
            // 自分の順位が一番悪い基地を入れ替える
            let best = options[0], bv = 1e9;
            options.forEach(bi => { const r = E.ranking(D, state, bi)[seat]; const v = r == null ? 1.5 : -r; if (v < bv) { bv = v; best = bi; } });
            return best;
          }
          case 'extraPlayUp': {
            let best = options[0], bv = -1;
            options.forEach(uid => { if (uid == null) return; const c = p.hand.find(x => x.uid === uid); const v = D.cards[c.cid].value + (E.canFaceUp(D, state, info.bi, c) ? 2 : 0); if (v > bv) { bv = v; best = uid; } });
            return best;
          }
          case 'extraPlay': case 'reanimate': case 'move': case 'moveOther': case 'moveSelf': {
            // 盤面に適用して評価
            let best = options[0], bv = -1e9;
            options.forEach(o => {
              const s2 = clone(state);
              applyBoardOption(s2, seat, kind, o, info);
              const v = H(s2, seat) - (kind === 'moveOther' ? H(s2, ownerOf(state, o)) * 0.3 : 0) + rand() * 0.01;
              if (v > bv) { bv = v; best = o; }
            });
            return best;
          }
        }
        return pick();
      };
    }
    function ownerOf(state, o) { const f = E.findCard(state, o[0]); return f ? f.card.owner : 0; }

    function applyBoardOption(s, seat, kind, o, info) {
      const p = s.players[seat];
      if (o == null) return;
      if (kind === 'extraPlay') {
        const i = p.hand.findIndex(h => h.uid === o[0]);
        const h = p.hand.splice(i, 1)[0]; h.faceUp = false; s.bases[o[1]].stacks[seat].push(h);
      } else if (kind === 'reanimate') {
        const i = p.trash.findIndex(h => h.uid === o[0]);
        const h = p.trash.splice(i, 1)[0]; h.faceUp = false; s.bases[o[1]].stacks[seat].push(h);
      } else if (kind === 'move' || kind === 'moveOther') {
        const f = E.findCard(s, o[0]); s.bases[f.bi].stacks[f.s].splice(f.i, 1); s.bases[o[1]].stacks[f.card.owner].push(f.card);
      } else if (kind === 'moveSelf') {
        const f = E.findCard(s, info.uid); if (!f) return; s.bases[f.bi].stacks[f.s].splice(f.i, 1); s.bases[o].stacks[seat].push(f.card);
      }
    }

    function randomChooser(rand) {
      return (state, seat, kind, options) => options[Math.floor(rand() * options.length)];
    }

    // 手札 1 枚を 1 か所に（表/裏も含めて）置いた結果を全部試し、評価が最大のものを返す
    function bestPlay(state, seat, rand, chooser, value) {
      const valueOf = value || (st => H(st, seat));
      const p = state.players[seat];
      let best = null;
      p.hand.forEach(c => {
        state.bases.forEach((b, bi) => {
          [false, true].forEach(up => {
            if (up && !E.canFaceUp(D, state, bi, c)) return;
            const s2 = clone(state);
            const pl = s2.players[seat];
            const i = pl.hand.findIndex(x => x.uid === c.uid);
            const card = pl.hand.splice(i, 1)[0];
            s2.bases[bi].stacks[seat].push(card);
            if (up) {
              card.faceUp = true;
              E.onReveal({ D, rand, chooser }, s2, card);
            }
            const v = valueOf(s2) + rand() * 0.05;
            if (!best || v > best.v) best = { v, uid: c.uid, bi, up, state: s2 };
          });
        });
      });
      return best;
    }

    // 行動選択：自分の配置＋公開だけを仮適用して評価（他人の同時手は読まない）
    // 2 枚まで置けるルールなら、1 枚目を置いた後の盤面でもう 1 枚置くかを同じように決める
    function greedyAction(state, seat, rand, chooser, value) {
      const valueOf = value || (st => H(st, seat));
      const p = state.players[seat];
      const target = 5;
      const w4 = state.bases.some((b) => b.stacks[seat].some(x => x.faceUp && x.cid === 'w4'));
      const refreshValue = valueOf(clone(state)) + 0.35 * Math.max(0, target - p.hand.length) * 0.9 - 1.2 + (w4 ? 1.5 : 0);
      const first = bestPlay(state, seat, rand, chooser, valueOf);
      if (!first || !(first.v > refreshValue)) return { action: { type: 'refresh' }, up: false, ups: {} };
      const ups = { [first.uid]: first.up };
      let action = { type: 'play', uid: first.uid, bi: first.bi };
      const maxPlays = state.rules ? state.rules.maxPlays : E.MAX_PLAYS;
      if (maxPlays >= 2) {
        const second = bestPlay(first.state, seat, rand, chooser, valueOf);
        if (second && second.v > first.v + SECOND_PLAY_MARGIN) {
          action = { type: 'play', plays: [{ uid: first.uid, bi: first.bi }, { uid: second.uid, bi: second.bi }] };
          ups[second.uid] = second.up;
        }
      }
      return { action, up: first.up, ups };
    }

    // ---------- 読むボット ----------
    // 相手の手札は見ない。公開情報（相手の派閥・どの基地にカードがあるか・基地の進み具合）から
    // 相手が置きそうな場所を予想し、その予想した盤面で自分の手を評価する。
    // さらに、先頭のプレイヤーが得をする手を少し嫌う（先頭を止める）。
    const READ_SCENARIOS = 4;
    const LEADER_WEIGHT = 0.3;

    function placeWeights(state, o) {
      const p = state.players[o];
      return state.bases.map((b, bi) => {
        const bdef = D.bases[b.id];
        const match = bdef.tags.some(t => p.factions.includes(t));
        const here = b.stacks[o].length > 0;
        const prog = Math.min(1, E.baseTotal(D, state, bi) / E.baseBP(D, state, bi));
        return 1 + (match ? 1.5 : 0) + (here ? 1 : 0) + prog * 1.5;
      });
    }

    function pickIndex(weights, rand) {
      const sum = weights.reduce((a, x) => a + x, 0);
      let r = rand() * sum;
      for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) return i; }
      return weights.length - 1;
    }

    // 予想：各相手が置く場所と枚数（派閥が合う基地なら表にできるぶん値を高めに見る＝伏せ札 2 枚ぶん）
    function makeScenarios(state, me, rand) {
      const out = [];
      for (let k = 0; k < READ_SCENARIOS; k++) {
        const sc = [];
        state.players.forEach((p, o) => {
          if (o === me || !p.hand.length && !p.handCount) return;
          const bi = pickIndex(placeWeights(state, o), rand);
          const match = D.bases[state.bases[bi].id].tags.some(t => p.factions.includes(t));
          sc.push({ o, bi, n: match ? 2 : 1 });
        });
        out.push(sc);
      }
      return out;
    }

    function withPhantoms(st, sc) {
      const t = clone(st);
      sc.forEach(({ o, bi, n }, k) => {
        for (let i = 0; i < n; i++) t.bases[bi].stacks[o].push({ uid: -1 - k * 4 - i, cid: null, owner: o, faceUp: false });
      });
      return t;
    }

    function readerValue(state, me, rand) {
      const scenarios = makeScenarios(state, me, rand);
      return st => {
        let sum = 0;
        scenarios.forEach(sc => {
          const t = withPhantoms(st, sc);
          let lead = -Infinity;
          t.players.forEach((_, o) => { if (o !== me) lead = Math.max(lead, H(t, o)); });
          sum += H(t, me) - LEADER_WEIGHT * lead;
        });
        return sum / scenarios.length;
      };
    }

    function readerAction(state, seat, rand, chooser) {
      return greedyAction(state, seat, rand, chooser, readerValue(state, seat, rand));
    }

    return { H, makeGreedyChooser, randomChooser, greedyAction, readerAction, applyBoardOption };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { createBots };
  else root.Bots = { createBots };
})(typeof window !== 'undefined' ? window : globalThis);
