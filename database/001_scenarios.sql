-- Run once in the Supabase SQL editor. Authentication owns guest identities.
create table if not exists public.scenarios (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 100),
 input jsonb not null,
 result jsonb not null,
 created_at timestamptz not null default now()
);
create index if not exists scenarios_owner_created_idx on public.scenarios(owner_id, created_at desc);
alter table public.scenarios enable row level security;
revoke all on public.scenarios from anon;
grant select, insert, delete on public.scenarios to authenticated;
drop policy if exists scenarios_owner_select on public.scenarios;
create policy scenarios_owner_select on public.scenarios for select to authenticated using (auth.uid() = owner_id);
drop policy if exists scenarios_owner_insert on public.scenarios;
create policy scenarios_owner_insert on public.scenarios for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists scenarios_owner_delete on public.scenarios;
create policy scenarios_owner_delete on public.scenarios for delete to authenticated using (auth.uid() = owner_id);
