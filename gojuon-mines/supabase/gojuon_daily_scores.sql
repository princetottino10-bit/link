-- 五十音マインスイーパ：むずいモードの今日のお題のランキング。Compile と同じ Supabase プロジェクトに置く
-- 誰でも読める。ゲスト（匿名ログイン）を含むログイン中の本人だけが、その日に1回だけ載せられる。
-- day は日本時間の日数（Date.now() + 9時間 を 86400 秒で割った値）。
create table if not exists public.gojuon_daily_scores (
  day integer not null check (day between 20000 and 40000),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 12 and name !~ '[[:cntrl:]]'),
  moves integer not null check (moves between 1 and 99),
  lives integer not null check (lives between 0 and 3),
  won boolean not null,
  created_at timestamptz not null default now(),
  primary key (day, user_id)
);

create index if not exists gojuon_daily_scores_rank_idx
  on public.gojuon_daily_scores(day, won, moves, lives desc, created_at);

alter table public.gojuon_daily_scores enable row level security;
revoke all on public.gojuon_daily_scores from anon, authenticated;
grant select on public.gojuon_daily_scores to anon, authenticated;
grant insert (day, name, moves, lives, won) on public.gojuon_daily_scores to authenticated;

drop policy if exists gojuon_daily_scores_read on public.gojuon_daily_scores;
create policy gojuon_daily_scores_read on public.gojuon_daily_scores
  for select to anon, authenticated using (true);

-- 載せられるのは今日と昨日のお題だけ（日付をまたいで終えた人のため昨日も許す）。
-- 負けたときはライフ 0 のときだけ
drop policy if exists gojuon_daily_scores_insert_own on public.gojuon_daily_scores;
create policy gojuon_daily_scores_insert_own on public.gojuon_daily_scores
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and day between floor((extract(epoch from now()) + 32400) / 86400)::integer - 1
                and floor((extract(epoch from now()) + 32400) / 86400)::integer
    and (won or lives = 0)
  );
