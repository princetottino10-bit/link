// エンジンの画面用 API のテスト：node game/sim/test.js
// resolveRound（選択待ちで止まって再開できるラウンド実行）が、止めずに回した場合と同じ結果になるかを確かめる。
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const E = require('../engine.js');
const D = E.indexData(JSON.parse(fs.readFileSync(path.join(__dirname, '../cards.json'), 'utf8')));
const { makeGreedyChooser, greedyAction } = require('../bots.js').createBots(E, D);
const FACTIONS = Object.keys(D.factions);

function newGame(seed) {
  const rand = E.rng(seed);
  const pool = E.shuffle(FACTIONS.slice(), rand);
  const picks = [[], [], [], []];
  [0, 1, 2, 3, 3, 2, 1, 0].forEach(s => picks[s].push(pool.shift()));
  return E.setup(D, picks, seed);
}

// 席ごとにボットの行動と、選択の答え方を決める
function planRound(state, seed) {
  const rand = E.rng(seed);
  const chooser = makeGreedyChooser(rand);
  const decided = state.players.map((_, s) => greedyAction(state, s, rand, chooser));
  const auto = (st, seat, kind, options, info) => kind === 'faceUp' ? (info && info.uid in decided[seat].ups ? decided[seat].ups[info.uid] : decided[seat].up) : chooser(st, seat, kind, options, info);
  return { actions: decided.map(d => d.action), auto };
}

let checks = 0;
for (let g = 1; g <= 40; g++) {
  let state = newGame(g);
  let pauses = 0;
  while (!state.over) {
    const { actions, auto } = planRound(state, g * 100 + state.round);
    const snapshot = JSON.stringify(state);
    // 一気に回す
    const straight = E.resolveRound(D, state, actions, [], auto);
    assert.strictEqual(straight.pending, null, '自動回答なら止まらない');
    // 人間役の席（g % 4）だけ毎回止めて、一気に回したときと同じ答えを後から入れる
    const human = g % 4;
    const run = answers => {
      let idx = answers.length;
      const manual = (st, seat) => seat === human ? undefined : straight.answers[idx++];
      return E.resolveRound(D, state, actions, answers, manual);
    };
    let r = run([]);
    while (r.pending) {
      pauses++;
      assert.strictEqual(r.pending.seat, human, '止まるのは人間役の席だけ');
      assert.ok(r.pending.options.length > 0, '候補がある');
      r = run(r.answers.concat([straight.answers[r.answers.length]]));
    }
    assert.deepStrictEqual(r.state, straight.state, '止めて再開しても同じ結果');
    assert.strictEqual(JSON.stringify(state), snapshot, '入力の状態は変更しない');
    state = r.state;
    checks++;
  }
  assert.ok(state.winners.length >= 1);
  assert.ok(state.events.some(e => e.type === 'score' && e.final), '最終採点のイベントがある');
  assert.ok(pauses > 0, `ゲーム ${g} で人間役の選択が一度もなかった`);
}

// faceUpBlock：派閥が合わない理由を返す
{
  const s = newGame(7);
  const c = s.players[0].hand[0];
  const fac = D.cards[c.cid].faction;
  const bi = s.bases.findIndex(b => !D.bases[b.id].tags.includes(fac));
  if (bi >= 0) {
    s.players[0].hand.shift();
    s.bases[bi].stacks[0].push(c);
    const why = E.faceUpBlock(D, s, bi, c);
    assert.strictEqual(why.code, 'faction');
    assert.strictEqual(E.canFaceUp(D, s, bi, c), false);
    checks++;
  }
}

console.log(`ok (${checks} checks)`);
