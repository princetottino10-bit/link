// node --test gojuon-mines/tests/rules.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  baseKana, mineLetters, variants, buildCells, neighborsOf, cellOfKana, floodOpen,
  checkAnswerShape, judgeGuess, knowledge, pickWords, formatTime, KANA_SET
} from '../js/rules.js';
import { LONG_WORDS } from '../js/long-words.js';

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

test('お題は 7〜10 文字で、同じ文字を2回使わず、全部盤面にある', () => {
  assert.ok(LONG_WORDS.length >= 150);
  for (const [w, kanji, genre] of LONG_WORDS) {
    assert.ok(genre, `${w} にジャンルがない`);
    const len = [...w].length;
    assert.ok(len >= 7 && len <= 10, w);
    assert.equal(mineLetters(w).length, len, w);
    assert.ok(mineLetters(w).every(k => KANA_SET.has(k)), w);
    assert.ok(kanji && !/[0-9０-９]/.test(kanji), w);
  }
  assert.equal(new Set(LONG_WORDS.map(x => x[0])).size, LONG_WORDS.length);
});

test('buildCells の数字は周り8マスの地雷の数', () => {
  const cells = buildCells('あいう');
  assert.equal(cells.filter(c => c.mine).length, 3);
  assert.equal(cells[cellOfKana(cells, 'か')].n, 2); // か の隣の地雷は あ い（う は2段下なので数えない）
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
  const ka = cellOfKana(cells, 'か');
  assert.deepEqual(floodOpen(cells, ka), [ka]); // 数字のマスからは広がらない
  assert.ok(!floodOpen(cells, ma, [ma]).length); // すでに開いたマスは返さない
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

test('pickWords は重ならず、避けたい言葉を後回しにする', () => {
  const list = [['あ'], ['い'], ['う'], ['え']];
  const got = pickWords(list, 3, new Set(['あ', 'い']));
  assert.equal(new Set(got.map(x => x[0])).size, 3);
  assert.ok(got.slice(0, 2).every(x => !['あ', 'い'].includes(x[0])));
});

test('formatTime は 分:秒.1/10秒', () => {
  assert.equal(formatTime(0), '0:00.0');
  assert.equal(formatTime(83456), '1:23.4');
  assert.equal(formatTime(3725000), '62:05.0');
});
