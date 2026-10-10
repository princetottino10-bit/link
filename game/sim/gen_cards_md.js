// cards.json から CARDS.md を生成する：node game/sim/gen_cards_md.js
const fs = require('fs'), path = require('path');
const d = JSON.parse(fs.readFileSync(path.join(__dirname, '../cards.json'), 'utf8'));
const out = [];
out.push(`# カードリスト v${d.version}（4人対戦）`, '');
out.push('> このファイルは `cards.json` から自動生成しています。カードを直すときは `cards.json` を編集し、`node game/sim/gen_cards_md.js` を実行してください。', '');
out.push('用語は [RULES.md](RULES.md) の「用語」を参照。「他人のカード」は、特に書かれていなければ**一番上のカード**を指す。', '');
out.push('## 派閥（8 種 × 6 枚）', '');
for (const [fid, f] of Object.entries(d.factions)) {
  out.push(`### ${f.name} — ${f.verb}`, '');
  out.push(`- **得意**：${f.good}`, `- **苦手**：${f.bad}`, `- **勝ち方**：${f.win}`, '');
  out.push('| 値 | 名前 | 効果 |', '|---|---|---|');
  d.cards.filter(c => c.faction === fid).forEach(c => out.push(`| ${c.value} | ${c.name} | ${c.text} |`));
  const tags = d.bases.filter(b => b.tags.includes(fid)).map(b => b.name).join('・');
  out.push('', `表向きにできる基地：${tags}`, '');
}
out.push('## 基地（12 枚）', '');
out.push('VP は 1位 / 2位 / 3位 / 4位。**表向き可**の派閥のカードだけが、その基地で表向きになれる。', '');
out.push('| 名前 | 耐久 | VP | 表向き可 | 特殊ルール |', '|---|---|---|---|---|');
d.bases.forEach(b => out.push(`| ${b.name} | ${b.bp} | ${b.vp.join(' / ')} | ${b.tags.map(t => d.factions[t].name).join('・')} | ${b.text || '—'} |`));
out.push('', '## 秘密の目標（8 枚）', '');
out.push('ゲーム開始時に 1 枚ずつ配り、終了時に公開する。達成していれば記載の VP を得る。', '');
out.push('| 名前 | 条件 | VP |', '|---|---|---|');
d.objectives.forEach(o => out.push(`| ${o.name} | ${o.text} | ${o.vp} |`));
fs.writeFileSync(path.join(__dirname, '../CARDS.md'), out.join('\n') + '\n');
console.log('CARDS.md を生成しました');
