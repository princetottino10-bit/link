// 盤面・かな・判定のロジック。DOM には触らない（node のテストからも読む）

// 左から ん わ ら や ま は な た さ か あ（縦書きの五十音表と同じ並び）。「・」は空きマス
export const TABLE = ['ん・・・・', 'わ・・・を', 'らりるれろ', 'や・ゆ・よ', 'まみむめも', 'はひふへほ',
                      'なにぬねの', 'たちつてと', 'さしすせそ', 'かきくけこ', 'あいうえお'];
export const COLS = TABLE.length;
export const ROWS = 5;
export const MAX_LIVES = 3;

// ---------- kana ----------
const SMALL = 'ぁぃぅぇぉっゃゅょゎ';
export const toHira = s => s.replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
export const baseKana = ch => {
  if (SMALL.includes(ch)) return String.fromCharCode(ch.charCodeAt(0) + 1);
  return ch.normalize('NFD').replace(/[゙゚]/g, '');
};
export const mineLetters = word => [...new Set([...word].map(baseKana))];

// ゛゜小 キー用：元→小→濁点→半濁点→元… の候補
export const variants = base => {
  const list = [base];
  const code = base.charCodeAt(0);
  if (SMALL.includes(String.fromCharCode(code - 1))) list.push(String.fromCharCode(code - 1));
  for (const mark of ['゙', '゚']) {
    const v = (base + mark).normalize('NFC');
    if (v.length === 1) list.push(v);
  }
  return list;
};

export const KANA_SET = new Set(TABLE.join('').replace(/・/g, ''));

// ---------- random ----------
export const shuffled = (arr, rnd = Math.random) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// list から n 個、avoid に入っていないものを選ぶ（足りなければ avoid も使う）
export function pickWords(list, n, avoid = new Set(), rnd = Math.random) {
  const fresh = shuffled(list.filter(x => !avoid.has(x[0])), rnd);
  const rest = shuffled(list.filter(x => avoid.has(x[0])), rnd);
  return [...fresh, ...rest].slice(0, n);
}

// 1:23.4 の形。1時間を超えたら分を伸ばす
export function formatTime(ms) {
  const t = Math.max(0, Math.floor(ms / 100));
  const min = Math.floor(t / 600), sec = Math.floor(t / 10) % 60, tenth = t % 10;
  return `${min}:${String(sec).padStart(2, '0')}.${tenth}`;
}

// ---------- board ----------
export const idx = (c, r) => c * ROWS + r;

// cells[i] = { kana, mine, n }。i = c * ROWS + r。空きマスは kana: null
export function buildCells(word) {
  const mines = new Set(mineLetters(word));
  const cells = [];
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
    const k = TABLE[c][r];
    cells.push({ kana: k === '・' ? null : k, mine: mines.has(k), n: 0 });
  }
  cells.forEach((cell, i) => {
    if (cell.kana) cell.n = neighborsOf(cells, i).filter(j => cells[j].mine).length;
  });
  return cells;
}

export function neighborsOf(cells, i) {
  const c = Math.floor(i / ROWS), r = i % ROWS, out = [];
  for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
    if (!dc && !dr) continue;
    const nc = c + dc, nr = r + dr;
    if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
    if (cells[idx(nc, nr)].kana) out.push(idx(nc, nr));
  }
  return out;
}

export const cellOfKana = (cells, kana) => cells.findIndex(c => c.kana === kana);

// 0 のマスを開けたら周りを連鎖して開く
// start から開くマスの一覧（地雷とすでに開いたマスは含まない）
export function floodOpen(cells, start, alreadyOpen = []) {
  const seen = new Set(alreadyOpen), out = [], stack = [start];
  while (stack.length) {
    const j = stack.pop();
    if (seen.has(j) || cells[j].mine) continue;
    seen.add(j);
    out.push(j);
    if (cells[j].n === 0) stack.push(...neighborsOf(cells, j));
  }
  return out;
}

// ---------- answers ----------
// 打ちまちがいはライフを減らさないので、先にはじく
export function checkAnswerShape(v, word) {
  if (!/^[ぁ-ゖ]+$/.test(v)) return { ok: false, reason: 'kana' };
  if ([...v].length !== [...word].length) return { ok: false, reason: 'length' };
  return { ok: true };
}

// 1文字ずつの判定。hit = 位置も文字も一致 / mine = 地雷の文字（元の文字で比べる） / miss = 地雷ではない
export function judgeGuess(guess, word) {
  const g = [...guess], w = [...word];
  const mines = new Set(mineLetters(word));
  return g.map((ch, i) => ch === w[i] ? 'hit' : mines.has(baseKana(ch)) ? 'mine' : 'miss');
}

// 盤面で分かったこと：0 のマスの周りと、答えで「地雷ではない」と出た文字は安全。答えで出た地雷の文字は確定
export function knowledge(cells, S) {
  const safe = new Set(), mines = new Set(S.booms);
  for (const i of S.open) {
    if (cells[i].n === 0) for (const j of neighborsOf(cells, i)) safe.add(j);
  }
  for (const { text, marks } of S.guesses) {
    [...text].forEach((ch, k) => {
      const i = cellOfKana(cells, baseKana(ch));
      if (i < 0) return;
      if (marks[k] === 'miss') safe.add(i); else mines.add(i);
    });
  }
  for (const i of S.open) safe.delete(i);
  for (const i of mines) safe.delete(i);
  return { safe, mines };
}

export const SHARE_MARK = { hit: '🟩', mine: '🟨', miss: '⬜' };

// ---------- ranked match ----------
export const MATCH_SIZE = 3;
export const HINT_PENALTY_MS = 30000;
