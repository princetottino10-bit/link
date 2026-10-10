// JMdict（よく使う言葉の版）から、読みが 7〜10 文字で同じ文字を2回使わない名詞を抜き出して js/long-words.js を作る
// 8〜10 文字だけだと 60 語ほどしかないので 7 文字も入れる
// 使い方: node gojuon-mines/tools/build-words.mjs <jmdict-eng-common-*.json>
// 辞書データ: JMdict (EDRDG) CC BY-SA 4.0 https://www.edrdg.org/edrdg/licence.html
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { baseKana, KANA_SET } from '../js/rules.js';

const MIN_LEN = 7, MAX_LEN = 10;
// 名詞として使える言葉だけ（「〜なくてはいけません」のような言い回しを外す）
const NOUN_POS = new Set(['n', 'adj-no', 'n-adv', 'n-t']);
// お題に向かない言葉
const NG = new Set(['えんじょこうさい']);

const src = process.argv[2];
if (!src) throw new Error('JMdict の JSON ファイルを指定してください');
const dict = JSON.parse(readFileSync(src, 'utf8'));

const isValid = kana => {
  const chars = [...kana];
  if (chars.length < MIN_LEN || chars.length > MAX_LEN) return false;
  if (!/^[ぁ-ゖ]+$/.test(kana)) return false;
  const bases = chars.map(baseKana);
  return bases.every(b => KANA_SET.has(b)) && new Set(bases).size === bases.length;
};

const words = new Map();
for (const entry of dict.words) {
  const kanji = entry.kanji.find(k => k.common) || entry.kanji[0];
  if (!kanji) continue; // かなだけの言葉（外来語など）は答えにくいので外す
  if (/[0-9０-９A-Za-zＡ-Ｚａ-ｚ]/.test(kanji.text)) continue; // 「１３日」のような数字入りは外す
  const isNoun = entry.sense.some(s => s.partOfSpeech.some(p => NOUN_POS.has(p)));
  if (!isNoun) continue;
  for (const kana of entry.kana) {
    if (!isValid(kana.text) || words.has(kana.text) || NG.has(kana.text)) continue;
    words.set(kana.text, { w: kana.text, kanji: kanji.text });
  }
}

const list = [...words.values()].sort((a, b) => a.w.localeCompare(b.w, 'ja'));
const out = fileURLToPath(new URL('../js/long-words.js', import.meta.url));
writeFileSync(out,
  '// 自動生成（tools/build-words.mjs）。手で編集しない\n' +
  '// 辞書データ: JMdict (EDRDG) CC BY-SA 4.0 https://www.edrdg.org/edrdg/licence.html\n' +
  `// 読みが ${MIN_LEN}〜${MAX_LEN} 文字で、同じ文字（濁点・小文字は元の文字で数える）を2回使わない言葉\n` +
  'export const LONG_WORDS = [\n' +
  list.map(x => `  [${JSON.stringify(x.w)}, ${JSON.stringify(x.kanji)}]`).join(',\n') +
  '\n];\n');
const byLen = {};
for (const x of list) byLen[[...x.w].length] = (byLen[[...x.w].length] || 0) + 1;
process.stdout.write(`${list.length} words ${JSON.stringify(byLen)}\n`);
