// 問題データの形式チェック。使い方: node quiz-dungeon/questions/check.mjs
// 形式の説明は同じフォルダの README.md
import { readFileSync, readdirSync } from 'node:fs';

const FAMILIES = ['anime', 'game', 'sports', 'music', 'movie', 'history', 'geo', 'science', 'food', 'words'];
const LEVELS = new Set(['normal', 'mania']);
const YOMI = /^[ぁ-ゖー]+$/;
const BAD_HEAD = /^[ぁぃぅぇぉっゃゅょゎゕゖー]/; // 1文字目ヒントに使えない
const dir = new URL('./', import.meta.url);

const errors = [];
const ids = new Set();
const summary = [];
for (const key of FAMILIES) {
  const file = `${key}.json`;
  if (!readdirSync(dir).includes(file)) { errors.push(`${file} がない`); continue; }
  const data = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
  const err = (q, msg) => errors.push(`${q?.id ?? file}: ${msg}`);
  if (data.family !== key) err(null, `family が ${key} でない`);
  for (const q of data.questions) {
    if (ids.has(q.id)) err(q, 'id が重複'); ids.add(q.id);
    if (!q.id.startsWith(`${key}-`)) err(q, 'id の頭が系統名でない');
    if (!q.genre) err(q, 'genre がない');
    if (!LEVELS.has(q.level)) err(q, `level が normal / mania でない`);
    if (!q.q || !q.q.endsWith('？')) err(q, '問題文が「？」で終わっていない');
    if (!q.answer) err(q, 'answer がない');
    if (!YOMI.test(q.yomi)) err(q, `yomi がひらがな（とー）だけでない: ${q.yomi}`);
    if (BAD_HEAD.test(q.yomi)) err(q, `yomi の1文字目が小さい文字か「ー」: ${q.yomi}`);
    for (const a of q.alt ?? []) if (!YOMI.test(a)) err(q, `alt がひらがなだけでない: ${a}`);
    if (!Array.isArray(q.wrong) || q.wrong.length !== 3) { err(q, 'wrong が3つでない'); continue; }
    const seen = new Set([q.answer, q.yomi, ...(q.alt ?? [])]);
    for (const w of q.wrong) {
      if (!Array.isArray(w) || w.length !== 2) { err(q, 'wrong の各項目は [表記, 読み]'); continue; }
      if (!YOMI.test(w[1])) err(q, `wrong の読みがひらがなだけでない: ${w[1]}`);
      if (seen.has(w[0]) || seen.has(w[1])) err(q, `wrong が答えか他のはずれと重複: ${w[0]}`);
      seen.add(w[0]); seen.add(w[1]);
    }
    if (!q.note) err(q, 'note（解説）がない');
  }
  const n = data.questions.length, m = data.questions.filter(q => q.level === 'mania').length;
  summary.push(`${key.padEnd(8)} ${String(n).padStart(3)}問（ふつう ${n - m} / マニアック ${m}）`);
}
console.log(summary.join('\n'));
console.log(`合計 ${ids.size}問`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
