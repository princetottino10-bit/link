// プロトコル・スマッシュ ボット（シミュレーターとホットシート版で共用）
// createBots(Engine, D) で、評価関数・選択関数・行動選択をまとめて返す。
(function (root) {
  'use strict';

  function createBots(E, D) {
    const clone = s => JSON.parse(JSON.stringify(s));

    // ---------- 評価関数 ----------
    function H(state, me) {
      const p = state.players[me];
      let h = p.vp + 0.35 * Math.min(p.hand.length, 6);
      const progressFloor = state.round / E.ROUNDS; // 最終ラウンドに全基地が採点されるので、終盤ほど確実
      state.bases.forEach((b, bi) => {
        if (!b.stacks[me].length) return;
        const bdef = D.bases[b.id];
        const prog = Math.max(Math.min(1, E.baseTotal(D, state, bi) / bdef.bp), progressFloor);
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

    // 行動選択：自分の配置＋公開だけを仮適用して評価（他人の同時手は読まない）
    function greedyAction(state, seat, rand, chooser) {
      const p = state.players[seat];
      let best = { type: 'refresh' }, bestUp = false;
      const sR = clone(state);
      const target = 5;
      const w4 = state.bases.some((b) => b.stacks[seat].some(x => x.faceUp && x.cid === 'w4'));
      let bv = H(sR, seat) + 0.35 * Math.max(0, target - p.hand.length) * 0.9 - 1.2 + (w4 ? 1.5 : 0);
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
            const v = H(s2, seat) + rand() * 0.05;
            if (v > bv) { bv = v; best = { type: 'play', uid: c.uid, bi }; bestUp = up; }
          });
        });
      });
      return { action: best, up: bestUp };
    }

    return { H, makeGreedyChooser, randomChooser, greedyAction, applyBoardOption };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { createBots };
  else root.Bots = { createBots };
})(typeof window !== 'undefined' ? window : globalThis);
