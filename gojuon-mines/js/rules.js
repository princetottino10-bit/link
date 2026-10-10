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

// 地雷の文字と文字数がまったく同じ単語は盤面で見分けられないので、先に出たほうだけ残す
export function buildPool(words) {
  const pool = [];
  const boardKeys = new Set();
  for (const [genre, list] of Object.entries(words)) {
    for (const w of list.split(/\s+/)) {
      const m = mineLetters(w);
      if (m.length < 3 || m.length > 8 || !m.every(k => KANA_SET.has(k))) continue;
      const key = [...m].sort().join('') + '/' + [...w].length;
      if (boardKeys.has(key)) continue;
      boardKeys.add(key);
      pool.push({ w, genre });
    }
  }
  return pool;
}

// ---------- seeded random / days ----------
export const mulberry32 = a => () => {
  a |= 0; a = a + 0x6D2B79F5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
export const shuffled = (arr, rnd) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const DAY0 = Math.floor(Date.UTC(2026, 9, 9) / 86400e3);
export const jstDay = (now = Date.now()) => Math.floor((now + 9 * 3600e3) / 86400e3);
export const dayLabel = d => {
  const dt = new Date(d * 86400e3);
  return `${dt.getUTCMonth() + 1}/${dt.getUTCDate()}`;
};

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

// ふつう：0 のマスから周りを連鎖して開く。むずい：1マスずつ
export const LEVELS = { normal: 'ふつう', hard: 'むずい' };

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

// ---------- score ----------
// 手数 = 開けたマス + 答えた回数。少ないほどすごい
export const TITLES = [
  [3, '神の一手'], [6, '名探偵'], [9, '探偵'], [13, '助手'], [Infinity, '見習い']
];
export const titleFor = moves => TITLES.find(([max]) => moves <= max)[1];
export const DIST_BUCKETS = ['1-3', '4-6', '7-9', '10-13', '14+'];
export const bucketFor = moves => DIST_BUCKETS[TITLES.findIndex(([max]) => moves <= max)];

export const SHARE_MARK = { hit: '🟩', mine: '🟨', miss: '⬜' };
