-- Idea Vault — ideas table + Row Level Security
-- Run in Supabase Dashboard → SQL Editor (see docs/SETUP.md step 2).
-- One idea = one user's project idea (Title + Description + README + Status).

create table public.ideas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null check (length(trim(title)) > 0),
  description text not null default '',
  readme      text not null default '',
  status      text not null default 'Idea'
              check (status in ('Idea', 'Building', 'Done')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Only the owner can ever read or touch their rows (enforced by the database).
alter table public.ideas enable row level security;

create policy "users manage own ideas"
  on public.ideas
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- List queries order by recency of update.
create index ideas_user_updated_idx on public.ideas (user_id, updated_at desc);
