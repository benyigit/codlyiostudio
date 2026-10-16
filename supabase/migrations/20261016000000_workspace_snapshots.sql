create table if not exists public.workspace_snapshots (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  revision bigint not null default 1 check (revision >= 1),
  updated_at timestamptz not null default now()
);

alter table public.workspace_snapshots enable row level security;

revoke all on table public.workspace_snapshots from public, anon, authenticated;
grant select, insert, update, delete on table public.workspace_snapshots to authenticated;

create policy "Users can read their own workspace snapshot"
  on public.workspace_snapshots
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own workspace snapshot"
  on public.workspace_snapshots
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own workspace snapshot"
  on public.workspace_snapshots
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own workspace snapshot"
  on public.workspace_snapshots
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.workspace_snapshots;
    exception when duplicate_object then
      null;
    end;
  end if;
end;
$$;
