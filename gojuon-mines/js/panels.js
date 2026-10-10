// 成績とランキングの中身を組み立てる。名前はサーバーから来るので必ず textContent で入れる
import { DIST_BUCKETS, LEVELS, dayLabel } from './rules.js';
import { liveStreak } from './stats.js';
import { fetchTop, myUserId, RankingError } from './ranking.js';

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};

function statCell(value, label) {
  const d = el('div');
  d.append(el('div', 'big', String(value)), el('div', 'label', label));
  return d;
}

// highlight: 今日の結果が入った分布の区切り（なければ null）
export function renderStats(root, stats, today, highlight, level) {
  root.replaceChildren();
  const rate = stats.played ? Math.round(stats.wins / stats.played * 100) : 0;
  const grid = el('div', 'stat-grid');
  grid.append(
    statCell(stats.played, '遊んだ'),
    statCell(`${rate}%`, '正解率'),
    statCell(liveStreak(stats, today), '連続正解'),
    statCell(stats.maxStreak, '最長連続')
  );
  root.append(el('div', 'sub-title', `今日のお題の成績（${LEVELS[level]}）`), grid);

  root.append(el('div', 'sub-title', `手数の分布${stats.best != null ? `（ベスト ${stats.best}手）` : ''}`));
  const rows = [...DIST_BUCKETS.map(b => [`${b}手`, stats.dist[b], b === highlight]), ['失敗', stats.fails, false]];
  const max = Math.max(1, ...rows.map(r => r[1]));
  for (const [label, n, me] of rows) {
    const row = el('div', 'dist-row');
    const bar = el('div', 'dist-bar' + (me ? ' me' : ''), String(n));
    bar.style.width = `${Math.max(8, n / max * 100)}%`;
    row.append(el('span', null, label), bar);
    root.append(row);
  }

  const genres = Object.entries(stats.genreBest);
  if (genres.length) {
    root.append(el('div', 'sub-title', 'ジャンル別ベスト（フリープレイ含む）'));
    const list = el('div', 'genre-list');
    for (const [g, m] of genres) list.append(el('span', null, g), el('span', null, `${m}手`));
    root.append(list);
  }
}

export async function renderRanking(root, day) {
  root.replaceChildren(
    el('div', 'sub-title', `むずいモード ${dayLabel(day)}のお題・正解した人を手数の少ない順に`),
    el('div', 'rank-empty', '読み込み中…'));
  let rows;
  try {
    rows = await fetchTop(day);
  } catch (e) {
    root.lastChild.textContent = e instanceof RankingError ? e.message : 'ランキングを読み込めませんでした';
    return;
  }
  if (!rows.length) {
    root.lastChild.textContent = 'まだだれも載っていません。一番乗りしよう！';
    return;
  }
  const me = myUserId();
  const list = el('ol', 'rank-list');
  let pos = 0, prev = null;
  rows.forEach((r, k) => {
    // 手数とライフが同じなら同じ順位
    const key = `${r.moves}/${r.lives}`;
    if (key !== prev) pos = k + 1;
    prev = key;
    const li = el('li', r.user_id === me ? 'me' : null);
    li.append(el('span', 'pos', String(pos)), el('span', 'nm', r.name), el('span', 'mv', `${r.moves}手`),
      el('span', null, '❤️'.repeat(r.lives)));
    list.append(li);
  });
  root.lastChild.replaceWith(list);
}
