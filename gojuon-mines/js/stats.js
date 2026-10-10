// 自分の成績（この端末の localStorage だけに残る）。ふつう・むずいで別々に数える
import { DIST_BUCKETS, bucketFor } from './rules.js';

const keyFor = level => level === 'hard' ? 'gojuon-mines:stats:hard' : 'gojuon-mines:stats';

const empty = () => ({
  played: 0, wins: 0, streak: 0, maxStreak: 0, lastDay: null, best: null,
  dist: Object.fromEntries(DIST_BUCKETS.map(b => [b, 0])), fails: 0,
  genreBest: {}
});

export function loadStats(level) {
  try {
    const s = JSON.parse(localStorage.getItem(keyFor(level)));
    return s ? { ...empty(), ...s, dist: { ...empty().dist, ...s.dist } } : empty();
  } catch {
    return empty();
  }
}

const saveStats = (level, s) => { try { localStorage.setItem(keyFor(level), JSON.stringify(s)); } catch {} };

// 今日のお題：連続記録と分布。フリープレイ：ジャンル別のベストだけ
export function recordResult({ level, mode, day, won, moves, genre }) {
  const s = loadStats(level);
  const genreBest = won && (s.genreBest[genre] == null || moves < s.genreBest[genre])
    ? { ...s.genreBest, [genre]: moves } : s.genreBest;
  if (mode !== 'daily') {
    const next = { ...s, genreBest };
    saveStats(level, next);
    return next;
  }
  const streak = won ? (s.lastDay === day - 1 ? s.streak + 1 : 1) : 0;
  const next = {
    ...s,
    genreBest,
    played: s.played + 1,
    wins: s.wins + (won ? 1 : 0),
    streak,
    maxStreak: Math.max(s.maxStreak, streak),
    lastDay: won ? day : s.lastDay,
    best: won && (s.best == null || moves < s.best) ? moves : s.best,
    dist: won ? { ...s.dist, [bucketFor(moves)]: s.dist[bucketFor(moves)] + 1 } : s.dist,
    fails: s.fails + (won ? 0 : 1)
  };
  saveStats(level, next);
  return next;
}

// 連続記録は、昨日も今日もクリアしていなければ途切れている
export const liveStreak = (s, today) => (s.lastDay === today || s.lastDay === today - 1 ? s.streak : 0);

export const NAME_KEY = 'gojuon-mines:name';
export const loadName = () => { try { return localStorage.getItem(NAME_KEY) || ''; } catch { return ''; } };
export const saveName = n => { try { localStorage.setItem(NAME_KEY, n); } catch {} };
