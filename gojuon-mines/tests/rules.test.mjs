// node --test gojuon-mines/tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  baseKana, mineLetters, variants, buildPool, buildCells, neighborsOf, cellOfKana, floodOpen,
  checkAnswerShape, judgeGuess, knowledge, titleFor, bucketFor, jstDay, DAY0, dayLabel
} from '../js/rules.js';
import { WORDS } from '../js/words.js';

test('baseKana は濁点・半濁点・小文字を元の文字に戻す', () => {
  assert.equal(baseKana('が'), 'か');
  assert.equal(baseKana('ぱ'), 'は');
  assert.equal(baseKana('っ'), 'つ');
  assert.equal(baseKana('ょ'), 'よ');
  assert.equal(baseKana('ゔ'), 'う');
  assert.equal(baseKana('あ'), 'あ');
});

test('mineLetters は重複を除いた元の文字', () => {
  assert.deepEqual(mineLetters('しゃぶしゃぶ'), ['し', 'や', 'ふ']);
});

test('variants は小文字・濁点・半濁点の順', () => {
  assert.deepEqual(variants('は'), ['は', 'ば', 'ぱ']);
  assert.deepEqual(variants('つ'), ['つ', 'っ', 'づ']);
  assert.deepEqual(variants('ん'), ['ん']);
});

test('buildPool は盤面が同じになる単語を1つにまとめる', () => {
  const pool = buildPool({ a: 'ぶどう とうふ', b: 'かかと きりん' });
  assert.deepEqual(pool.map(p => p.w), ['ぶどう', 'きりん']);
});

test('本番のお題に盤面の重複がない', () => {
  const pool = buildPool(WORDS);
  const keys = pool.map(p => mineLetters(p.w).sort().join('') + [...p.w].length);
  assert.equal(new Set(keys).size, keys.length);
  assert.ok(pool.length >= 200);
});

test('buildCells の数字は周り8マスの地雷の数', () => {
  const cells = buildCells('あいう');
  assert.equal(cells.filter(c => c.mine).length, 3);
  const ka = cellOfKana(cells, 'か');
  assert.equal(cells[ka].n, 2); // か の隣の地雷は あ い（う は2段下なので数えない）
  assert.equal(cells[cellOfKana(cells, 'け')].n, 1); // け の斜め上が う
  assert.equal(cells[cellOfKana(cells, 'ま')].n, 0);
  assert.equal(neighborsOf(cells, cellOfKana(cells, 'ん')).length, 1); // ん の隣は わ だけ
});

test('floodOpen は 0 のマスから連鎖し、地雷と開いたマスは含まない', () => {
  const cells = buildCells('あいう');
  const ma = cellOfKana(cells, 'ま');
  const out = floodOpen(cells, ma);
  assert.ok(out.length > 10);
  assert.ok(out.every(i => !cells[i].mine));
  assert.ok(out.includes(cellOfKana(cells, 'ん')));
  // 数字のマスからは広がらない
  const ka = cellOfKana(cells, 'か');
  assert.deepEqual(floodOpen(cells, ka), [ka]);
  // すでに開いたマスは返さない
  assert.ok(!floodOpen(cells, ma, [ma]).length);
});

test('checkAnswerShape は文字数違いとひらがな以外をはじく', () => {
  assert.deepEqual(checkAnswerShape('りんご', 'りんご'), { ok: true });
  assert.equal(checkAnswerShape('りんごあ', 'りんご').reason, 'length');
  assert.equal(checkAnswerShape('ringo', 'りんご').reason, 'kana');
  assert.equal(checkAnswerShape('リンゴ', 'りんご').reason, 'kana'); // カタカナは呼び出し側で直す
});

test('judgeGuess は hit / mine / miss を返す', () => {
  assert.deepEqual(judgeGuess('すいか', 'すいか'), ['hit', 'hit', 'hit']);
  assert.deepEqual(judgeGuess('いかす', 'すいか'), ['mine', 'mine', 'mine']);
  assert.deepEqual(judgeGuess('すがた', 'すいか'), ['hit', 'mine', 'miss']); // が → か は地雷の文字
});

test('knowledge は 0 の周りと誤答の miss を安全、誤答の地雷を確定にする', () => {
  const word = 'すいか';
  const cells = buildCells(word);
  const ma = cellOfKana(cells, 'ま');
  const S = { open: [ma], booms: [], guesses: [{ text: 'すがた', marks: judgeGuess('すがた', word) }] };
  const { safe, mines } = knowledge(cells, S);
  for (const j of neighborsOf(cells, ma)) assert.ok(safe.has(j));
  assert.ok(safe.has(cellOfKana(cells, 'た')));
  assert.ok(mines.has(cellOfKana(cells, 'す')));
  assert.ok(mines.has(cellOfKana(cells, 'か')));
  assert.ok(!safe.has(ma));
});

test('称号と分布の区切りがそろっている', () => {
  assert.equal(titleFor(1), '神の一手');
  assert.equal(titleFor(6), '名探偵');
  assert.equal(titleFor(40), '見習い');
  assert.equal(bucketFor(3), '1-3');
  assert.equal(bucketFor(14), '14+');
});

test('日本時間の日付', () => {
  assert.equal(jstDay(Date.UTC(2026, 9, 8, 15, 0)), DAY0); // 10/9 0:00 JST
  assert.equal(jstDay(Date.UTC(2026, 9, 8, 14, 59)), DAY0 - 1);
  assert.equal(dayLabel(DAY0), '10/9');
});
