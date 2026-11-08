-- IMRO ESPORTS starter database schema for Supabase
-- Review and apply only after creating your Supabase project.
create extension if not exists pgcrypto;

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'IMRO ESPORTS',
  registration_open boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  ign text not null check (char_length(ign) between 1 and 40),
  player_uid text not null check (char_length(player_uid) between 3 and 24),
  contact_number text not null check (char_length(contact_number) between 7 and 20),
  tier text not null check (tier in ('Tier 1','Tier 2','Tier 3')),
  note text check (char_length(coalesce(note,'')) <= 250),
  consent boolean not null default false check (consent = true),
  created_at timestamptz not null default now(),
  unique (tournament_id, player_uid)
);

create table if not exists public.reserve_players (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  ign text not null,
  player_uid text not null,
  tier text not null check (tier in ('Tier 1','Tier 2','Tier 3')),
  created_at timestamptz not null default now()
);

create table if not exists public.draws (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft','published')),
  generated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references public.draws(id) on delete cascade,
  tier text not null check (tier in ('Tier 1','Tier 2','Tier 3')),
  player_one text not null,
  player_two text,
  status text not null default 'scheduled' check (status in ('scheduled','completed','bye')),
  winner text
);

alter table public.tournaments enable row level security;
alter table public.registrations enable row level security;
alter table public.reserve_players enable row level security;
alter table public.draws enable row level security;
alter table public.matches enable row level security;

-- Intentionally no public SELECT/INSERT policies are created here.
-- Do not collect real registrations until secure server-side submission,
-- organizer authentication, and admin-only policies/RPCs are implemented.
-- Keep the Supabase service-role key server-side only; never put it in index.html.
