// 成績とランキングの中身を組み立てる。名前はサーバーから来るので必ず textContent で入れる
import { formatTime } from './rules.js';
import { fetchTop, fetchMyStanding, myUserId, RankingError } from './ranking.js';

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

export function renderStats(root, stats) {
  root.replaceChildren();
  const r = stats.ranked, p = stats.practice;

  const rankGrid = el('div', 'stat-grid');
  rankGrid.append(
    statCell(r.played, '挑戦'),
    statCell(r.cleared, '完走'),
    statCell(r.bestTime != null ? formatTime(r.bestTime) : '-', 'ベスト'),
    statCell(r.bestMoves != null ? `${r.bestMoves}手` : '-', 'そのときの手数')
  );
  root.append(el('div', 'sub-title', 'ランクマッチ（3問のタイム）'), rankGrid);

  if (r.recent.length) {
    root.append(el('div', 'sub-title', `最近の完走タイム（${r.recent.length}回）`));
    const max = Math.max(...r.recent.map(x => x.timeMs));
    for (const x of [...r.recent].reverse()) {
      const row = el('div', 'dist-row');
      const bar = el('div', 'dist-bar' + (x.timeMs === r.bestTime ? ' me' : ''), formatTime(x.timeMs));
      bar.style.width = `${Math.max(30, x.timeMs / max * 100)}%`;
      row.append(el('span', null, `${x.moves}手`), bar);
      root.append(row);
    }
  }

  const practiceGrid = el('div', 'stat-grid');
  practiceGrid.append(
    statCell(p.played, '遊んだ'),
    statCell(p.solved, '正解'),
    statCell(p.played ? `${Math.round(p.solved / p.played * 100)}%` : '-', '正解率'),
    statCell(p.bestMoves != null ? `${p.bestMoves}手` : '-', 'ベスト手数')
  );
  root.append(el('div', 'sub-title', '練習'), practiceGrid);
}

export async function renderRanking(root) {
  root.replaceChildren(
    el('div', 'sub-title', 'ランクマッチ・3問を解き終えるまでのタイム（1人1つ、ベスト記録）'),
    el('div', 'rank-empty', '読み込み中…'));
  let rows, mine;
  try {
    [rows, mine] = await Promise.all([fetchTop(), fetchMyStanding()]);
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
    // タイムと手数が同じなら同じ順位
    const key = `${r.time_ms}/${r.moves}`;
    if (key !== prev) pos = k + 1;
    prev = key;
    const li = el('li', r.user_id === me ? 'me' : null);
    li.append(el('span', 'pos', String(pos)), el('span', 'nm', r.name),
      el('span', 'mv', formatTime(r.time_ms)), el('span', null, `${r.moves}手`));
    list.append(li);
  });
  root.lastChild.replaceWith(list);
  if (mine) root.append(el('div', 'rank-note', `あなたのベスト：${mine.rank}位 / ${mine.total}人中（${formatTime(mine.timeMs)}・${mine.moves}手）`));
}
