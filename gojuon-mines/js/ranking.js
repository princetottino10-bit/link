// ランクマッチ（3問のタイム）のランキング（Supabase）。ライブラリを使わず REST を直接たたく
// url と key はブラウザ公開用（Compile と同じプロジェクト）。service_role key は絶対に書かない
const CONFIG = {
  url: 'https://nkmyhflfdkrrlahyemyn.supabase.co',
  key: 'sb_publishable_pInYvRWiso5cvZMnZnEhgw_foOjy3mC'
};
const TABLE = 'gojuon_rank_scores';
const BEST = 'gojuon_rank_best'; // 1人1行（ベスト記録）のビュー
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
export async function submitScore({ name, timeMs, moves }) {
  const auth = await session();
  const res = await request(`/rest/v1/${TABLE}`, {
    method: 'POST',
    token: auth.token,
    headers: { Prefer: 'return=minimal' },
    body: { name, time_ms: Math.round(timeMs), moves }
  });
  if (!res.ok) throw new RankingError('ランキングに登録できませんでした（少し待ってからもう一度）');
}

async function count(query) {
  // 空のときに Range ヘッダーだと 416 を返す版があるので、limit で絞る
  const res = await request(`/rest/v1/${BEST}?select=user_id&limit=1&${query}`, {
    method: 'HEAD',
    headers: { Prefer: 'count=exact' }
  });
  if (!res.ok) throw new RankingError('ランキングを読み込めませんでした');
  const total = Number((res.headers.get('content-range') || '').split('/')[1]);
  return Number.isFinite(total) ? total : 0;
}

// タイムが短い順、同じタイムなら手数が少ない順（1人1行）
export async function fetchTop(limit = 30) {
  const q = `select=user_id,name,time_ms,moves&order=time_ms.asc,moves.asc,created_at.asc&limit=${limit}`;
  const res = await request(`/rest/v1/${BEST}?${q}`);
  if (!res.ok) throw new RankingError('ランキングを読み込めませんでした');
  return res.json();
}

// 自分のベスト記録と順位。まだ登録していなければ null
export async function fetchMyStanding() {
  const me = myUserId();
  if (!me) return null;
  const res = await request(`/rest/v1/${BEST}?select=time_ms,moves&user_id=eq.${encodeURIComponent(me)}`);
  if (!res.ok) throw new RankingError('ランキングを読み込めませんでした');
  const [best] = await res.json();
  if (!best) return null;
  const [better, total] = await Promise.all([
    count(`or=(time_ms.lt.${best.time_ms},and(time_ms.eq.${best.time_ms},moves.lt.${best.moves}))`),
    count('')
  ]);
  return { rank: better + 1, total, timeMs: best.time_ms, moves: best.moves };
}
