-- Safe Supabase SQL to keep public viewers read-only while allowing server-side writes.
-- Run these in the Supabase SQL editor after confirming the table names and column names.

alter table public."Matches" enable row level security;
alter table public."Players" enable row level security;
alter table public."Rounds" enable row level security;
alter table public."Scores" enable row level security;

create policy if not exists "matches_select_public"
  on public."Matches"
  for select
  using (true);

create policy if not exists "players_select_public"
  on public."Players"
  for select
  using (true);

create policy if not exists "rounds_select_public"
  on public."Rounds"
  for select
  using (true);

create policy if not exists "scores_select_public"
  on public."Scores"
  for select
  using (true);

-- No INSERT/UPDATE/DELETE policies are created for the public anon role.
-- Server-side code should use the Supabase service role key for writes.
