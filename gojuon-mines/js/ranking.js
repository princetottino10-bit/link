// 今日のお題のランキング（Supabase）。ライブラリを使わず REST を直接たたく
// url と key はブラウザ公開用（Compile と同じプロジェクト）。service_role key は絶対に書かない
const CONFIG = {
  url: 'https://nkmyhflfdkrrlahyemyn.supabase.co',
  key: 'sb_publishable_pInYvRWiso5cvZMnZnEhgw_foOjy3mC'
};
const TABLE = 'gojuon_daily_scores';
const AUTH_KEY = 'gojuon-mines:auth';
const TIMEOUT_MS = 8000;

export class RankingError extends Error {}

async function request(path, { method = 'GET', headers = {}, body, token } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(CONFIG.url + path, {
      method,
      signal: ctrl.signal,
      headers: {
        apikey: CONFIG.key,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
    return res;
  } catch (e) {
    throw new RankingError('ランキングに接続できませんでした');
  } finally {
    clearTimeout(timer);
  }
}

// ---------- ゲストログイン（匿名） ----------
const loadAuth = () => { try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; } };
const saveAuth = a => { try { localStorage.setItem(AUTH_KEY, JSON.stringify(a)); } catch {} };
const pickAuth = j => ({ token: j.access_token, refresh: j.refresh_token, expiresAt: j.expires_at, userId: j.user && j.user.id });

async function signInGuest() {
  const res = await request('/auth/v1/signup', { method: 'POST', body: {} });
  if (!res.ok) throw new RankingError('ゲストログインできませんでした');
  const auth = pickAuth(await res.json());
  saveAuth(auth);
  return auth;
}

async function refresh(auth) {
  const res = await request('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: auth.refresh } });
  if (!res.ok) return null;
  const next = pickAuth(await res.json());
  saveAuth(next);
  return next;
}

async function session() {
  const auth = loadAuth();
  if (auth && auth.token && auth.expiresAt * 1000 > Date.now() + 60e3) return auth;
  if (auth && auth.refresh) {
    const next = await refresh(auth);
    if (next) return next;
    // 別のタブが先に更新していたら、そちらを使う（新しいゲストを作ると同じ人が2回載れてしまう）
    const latest = loadAuth();
    if (latest && latest.token !== auth.token && latest.expiresAt * 1000 > Date.now() + 60e3) return latest;
  }
  return signInGuest();
}

export const myUserId = () => (loadAuth() || {}).userId || null;

// ---------- スコア ----------
// 1日1回だけ。2回目は already: true を返す
export async function submitScore({ day, name, moves, lives, won }) {
  const auth = await session();
  const res = await request(`/rest/v1/${TABLE}`, {
    method: 'POST',
    token: auth.token,
    headers: { Prefer: 'return=minimal' },
    body: { day, name, moves, lives, won }
  });
  if (res.status === 409) return { already: true };
  if (!res.ok) throw new RankingError('ランキングに登録できませんでした');
  return { already: false };
}

async function count(query) {
  // 空の日に Range ヘッダーだと 416 を返す版があるので、limit で絞る
  const res = await request(`/rest/v1/${TABLE}?select=user_id&limit=1&${query}`, {
    method: 'HEAD',
    headers: { Prefer: 'count=exact' }
  });
  if (!res.ok) throw new RankingError('ランキングを読み込めませんでした');
  const total = Number((res.headers.get('content-range') || '').split('/')[1]);
  return Number.isFinite(total) ? total : 0;
}

// 正解した人を 手数 → 残りライフ → 早い順 で並べる
export async function fetchTop(day, limit = 30) {
  const q = `select=user_id,name,moves,lives&day=eq.${day}&won=is.true&order=moves.asc,lives.desc,created_at.asc&limit=${limit}`;
  const res = await request(`/rest/v1/${TABLE}?${q}`);
  if (!res.ok) throw new RankingError('ランキングを読み込めませんでした');
  return res.json();
}

// 自分より上の人数と、参加者の総数
export async function fetchStanding(day, { moves, lives, won }) {
  const total = await count(`day=eq.${day}`);
  if (!won) return { rank: null, total };
  const better = await count(`day=eq.${day}&won=is.true&or=(moves.lt.${moves},and(moves.eq.${moves},lives.gt.${lives}))`);
  return { rank: better + 1, total };
}
