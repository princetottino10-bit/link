// 自分の成績（この端末の localStorage だけに残る）
const KEY = 'gojuon-mines:stats2';
const HISTORY = 10;

const empty = () => ({
  practice: { played: 0, solved: 0, bestMoves: null },
  ranked: { played: 0, cleared: 0, bestTime: null, bestMoves: null, recent: [] }
});

export function loadStats() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (!s) return empty();
    const e = empty();
    return { practice: { ...e.practice, ...s.practice }, ranked: { ...e.ranked, ...s.ranked } };
  } catch {
    return empty();
  }
}

const saveStats = s => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };

export function recordPractice({ won, moves }) {
  const s = loadStats();
  const p = s.practice;
  const next = {
    ...s,
    practice: {
      played: p.played + 1,
      solved: p.solved + (won ? 1 : 0),
      bestMoves: won && (p.bestMoves == null || moves < p.bestMoves) ? moves : p.bestMoves
    }
  };
  saveStats(next);
  return next;
}

// cleared: 3問とも解けたとき。timeMs と moves はそのときだけ意味がある
export function recordMatch({ cleared, timeMs, moves }) {
  const s = loadStats();
  const r = s.ranked;
  const better = cleared && (r.bestTime == null || timeMs < r.bestTime || (timeMs === r.bestTime && moves < r.bestMoves));
  const next = {
    ...s,
    ranked: {
      played: r.played + 1,
      cleared: r.cleared + (cleared ? 1 : 0),
      bestTime: better ? timeMs : r.bestTime,
      bestMoves: better ? moves : r.bestMoves,
      recent: cleared ? [...r.recent, { timeMs, moves }].slice(-HISTORY) : r.recent
    }
  };
  saveStats(next);
  return { stats: next, newBest: better };
}

export const NAME_KEY = 'gojuon-mines:name';
export const loadName = () => { try { return localStorage.getItem(NAME_KEY) || ''; } catch { return ''; } };
export const saveName = n => { try { localStorage.setItem(NAME_KEY, n); } catch {} };
