-- 五十音マインスイーパ：ランクマッチ（3問を解き終えるまでのタイム）のランキング。Compile と同じ Supabase プロジェクトに置く
-- 誰でも読める。ゲスト（匿名ログイン）を含むログイン中の本人だけが、自分の記録を足せる。消す・書き換えるはできない。
-- 順位は1人1つ（自分のベスト）。タイムが短い順、同じタイムなら手数が少ない順。
create table if not exists public.gojuon_rank_scores (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 12 and name !~ '[[:cntrl:]]'),
  -- 3問で 10 秒を切るのは無理なので弾く。上限は 2 時間
  time_ms integer not null check (time_ms between 10000 and 7200000),
  moves integer not null check (moves between 3 and 300),
  created_at timestamptz not null default now()
);

create index if not exists gojuon_rank_scores_user_idx on public.gojuon_rank_scores(user_id, time_ms, moves);

alter table public.gojuon_rank_scores enable row level security;
revoke all on public.gojuon_rank_scores from anon, authenticated;
grant select on public.gojuon_rank_scores to anon, authenticated;
grant insert (name, time_ms, moves) on public.gojuon_rank_scores to authenticated;

drop policy if exists gojuon_rank_scores_read on public.gojuon_rank_scores;
create policy gojuon_rank_scores_read on public.gojuon_rank_scores
  for select to anon, authenticated using (true);

-- 連投を防ぐため、同じ人は 30 秒に1回まで
drop policy if exists gojuon_rank_scores_insert_own on public.gojuon_rank_scores;
create policy gojuon_rank_scores_insert_own on public.gojuon_rank_scores
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and not exists (
      select 1 from public.gojuon_rank_scores s
      where s.user_id = auth.uid() and s.created_at > now() - interval '30 seconds'
    )
  );

-- 1人1行（ベスト記録）のビュー。名前は最新の登録名を使う
create or replace view public.gojuon_rank_best
with (security_invoker = true) as
select b.user_id, n.name, b.time_ms, b.moves, b.created_at
from (
  select distinct on (user_id) user_id, time_ms, moves, created_at
  from public.gojuon_rank_scores
  order by user_id, time_ms, moves, created_at
) b
join lateral (
  select name from public.gojuon_rank_scores s
  where s.user_id = b.user_id
  order by s.created_at desc
  limit 1
) n on true;

grant select on public.gojuon_rank_best to anon, authenticated;
