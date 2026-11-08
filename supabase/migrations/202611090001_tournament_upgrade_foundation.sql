-- IMRO ESPORTS tournament upgrade: additive foundation
-- Apply to Supabase only after reviewing this migration. It does not alter or delete existing player data.
begin;

alter table public.registrations
  add column if not exists avatar_id smallint check (avatar_id between 1 and 64);

alter table public.players
  add column if not exists avatar_id smallint check (avatar_id between 1 and 64);

alter table public.tournaments
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists format text not null default 'single_elimination'
    check (format in ('single_elimination','double_elimination'));

alter table public.matches
  add column if not exists next_match_id uuid references public.matches(id) on delete set null,
  add column if not exists next_match_slot smallint check (next_match_slot in (1,2)),
  add column if not exists winner_confirmed_at timestamptz;

create index if not exists registrations_tournament_tier_idx
  on public.registrations(tournament_id, tier);
create index if not exists players_tournament_tier_status_idx
  on public.players(tournament_id, tier, status);
create index if not exists matches_tournament_tier_round_idx
  on public.matches(tournament_id, tier, round_number);
create index if not exists matches_next_match_idx
  on public.matches(next_match_id);

create table if not exists public.avatar_catalog (
  id smallint primary key check (id between 1 and 64),
  category text not null,
  label text not null,
  symbol text not null,
  active boolean not null default true
);

insert into public.avatar_catalog(id,category,label,symbol) values
(1,'Cyber Warriors','Neon Vanguard','⚔️'),(2,'Cyber Warriors','Cyber Ronin','🥷'),
(3,'Cyber Warriors','Pulse Striker','⚡'),(4,'Cyber Warriors','Chrome Sentinel','🛡️'),
(5,'Cyber Warriors','Plasma Knight','🔱'),(6,'Cyber Warriors','Nova Ranger','🏹'),
(7,'Cyber Warriors','Circuit Ninja','🎭'),(8,'Cyber Warriors','Titan Guard','🦾'),
(9,'Legends & Fantasy','Dragon Lord','🐉'),(10,'Legends & Fantasy','Phoenix Soul','🔥'),
(11,'Legends & Fantasy','Frost Mage','❄️'),(12,'Legends & Fantasy','Shadow Elf','🧝'),
(13,'Legends & Fantasy','Storm Giant','🌩️'),(14,'Legends & Fantasy','Arcane Sage','🪄'),
(15,'Legends & Fantasy','Griffin Rider','🦅'),(16,'Legends & Fantasy','Doom Reaper','💀'),
(17,'Elite Gamers','Headshot Ace','🎯'),(18,'Elite Gamers','Clutch Master','🏆'),
(19,'Elite Gamers','Rush Captain','🚀'),(20,'Elite Gamers','Sniper Elite','🔭'),
(21,'Elite Gamers','Battle MVP','🥇'),(22,'Elite Gamers','Pro Tactician','♟️'),
(23,'Elite Gamers','Victory Star','🌟'),(24,'Elite Gamers','Rival Breaker','💥'),
(25,'Shadow Squad','Night Stalker','🌑'),(26,'Shadow Squad','Phantom','👻'),
(27,'Shadow Squad','Silent Blade','🗡️'),(28,'Shadow Squad','Blackout','🕶️'),
(29,'Shadow Squad','Wraith','☠️'),(30,'Shadow Squad','Smoke Ghost','🌫️'),
(31,'Shadow Squad','Dark Hunter','🐺'),(32,'Shadow Squad','Void Walker','🌀'),
(33,'Robots & Neon','Mecha Core','🤖'),(34,'Robots & Neon','Robo Ranger','🦿'),
(35,'Robots & Neon','Neon Bot','💠'),(36,'Robots & Neon','Cyber Droid','🦿'),
(37,'Robots & Neon','AI Overlord','🧠'),(38,'Robots & Neon','Laser Unit','🔦'),
(39,'Robots & Neon','Mech Pilot','🚁'),(40,'Robots & Neon','Chrome Bot','⚙️'),
(41,'Mythical','Thunder Beast','🐲'),(42,'Mythical','Moon Guardian','🌙'),
(43,'Mythical','Sea Serpent','🐍'),(44,'Mythical','Spirit Fox','🦊'),
(45,'Mythical','Celestial Wolf','🐺'),(46,'Mythical','Star Oracle','✨'),
(47,'Mythical','Ancient Golem','🗿'),(48,'Mythical','Sky Phoenix','🪽'),
(49,'Cyber Warriors','Volt Samurai','🔋'),(50,'Cyber Warriors','Iron Falcon','🦅'),
(51,'Legends & Fantasy','Rune Keeper','📜'),(52,'Legends & Fantasy','Crystal Witch','🔮'),
(53,'Elite Gamers','Final Zone King','👑'),(54,'Elite Gamers','One Tap Legend','💫'),
(55,'Shadow Squad','Midnight Crow','🐦‍⬛'),(56,'Shadow Squad','Spectre Agent','🕵️'),
(57,'Robots & Neon','Holo Pilot','🛸'),(58,'Robots & Neon','Quantum Unit','⚛️'),
(59,'Mythical','Lionheart','🦁'),(60,'Mythical','Ice Dragon','🐉'),
(61,'Elite Gamers','Tournament Ace','🎮'),(62,'Cyber Warriors','Hyper Blade','⚔️'),
(63,'Shadow Squad','Ghost Commander','👤'),(64,'Mythical','Eternal Guardian','🪽')
on conflict (id) do nothing;

create table if not exists public.tier_scoring_rules (
  tier smallint primary key check (tier between 1 and 3),
  match_win_points integer not null default 0 check (match_win_points >= 0),
  runner_up_points integer not null default 0 check (runner_up_points >= 0),
  champion_bonus integer not null default 0 check (champion_bonus >= 0),
  promotion_bonus integer not null default 0 check (promotion_bonus >= 0),
  updated_at timestamptz not null default now()
);

insert into public.tier_scoring_rules(tier,match_win_points,runner_up_points,champion_bonus,promotion_bonus)
values (1,10,5,25,15),(2,20,10,50,30),(3,30,15,100,50)
on conflict (tier) do nothing;

create table if not exists public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  match_id uuid references public.matches(id) on delete set null,
  event_type text not null check (event_type in ('match_win','runner_up','champion','promotion','admin_adjustment','reversal')),
  points integer not null,
  note text,
  reverses_entry_id uuid references public.points_ledger(id) on delete set null,
  created_at timestamptz not null default now(),
  created_by uuid
);

create unique index if not exists points_ledger_one_match_win
  on public.points_ledger(match_id, player_id, event_type)
  where match_id is not null and event_type = 'match_win';

create table if not exists public.leaderboard_totals (
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  tier smallint not null check (tier between 1 and 3),
  points integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (tournament_id, player_id)
);

alter table public.avatar_catalog enable row level security;
alter table public.tier_scoring_rules enable row level security;
alter table public.points_ledger enable row level security;
alter table public.leaderboard_totals enable row level security;

drop policy if exists "Public reads active avatar catalog" on public.avatar_catalog;
create policy "Public reads active avatar catalog" on public.avatar_catalog
  for select using (active = true);

drop policy if exists "Admins manage avatar catalog" on public.avatar_catalog;
create policy "Admins manage avatar catalog" on public.avatar_catalog
  for all using (is_imro_admin()) with check (is_imro_admin());

drop policy if exists "Admins manage tier scoring rules" on public.tier_scoring_rules;
create policy "Admins manage tier scoring rules" on public.tier_scoring_rules
  for all using (is_imro_admin()) with check (is_imro_admin());

drop policy if exists "Admins manage points ledger" on public.points_ledger;
create policy "Admins manage points ledger" on public.points_ledger
  for all using (is_imro_admin()) with check (is_imro_admin());

drop policy if exists "Admins manage leaderboard totals" on public.leaderboard_totals;
create policy "Admins manage leaderboard totals" on public.leaderboard_totals
  for all using (is_imro_admin()) with check (is_imro_admin());

drop policy if exists "Public reads leaderboard after tournament starts" on public.leaderboard_totals;
create policy "Public reads leaderboard after tournament starts" on public.leaderboard_totals
  for select using (
    exists (
      select 1 from public.tournaments t
      where t.id = leaderboard_totals.tournament_id
        and t.started_at is not null
    )
  );

-- Enable Realtime for live leaderboard refreshes when the publication exists.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'leaderboard_totals'
    ) then
      execute 'alter publication supabase_realtime add table public.leaderboard_totals';
    end if;
  end if;
end $$;

-- Preserve the selected registration avatar when the existing trigger creates a player row.
create or replace function public.create_player_from_registration()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  insert into public.players (
    registration_id,
    tournament_id,
    player_name,
    game_uid,
    whatsapp,
    tier,
    status,
    avatar_id
  )
  values (
    new.id,
    new.tournament_id,
    new.ign,
    new.player_uid,
    new.contact_number,
    case new.tier
      when 'Tier 1' then 1
      when 'Tier 2' then 2
      when 'Tier 3' then 3
    end,
    'pending',
    new.avatar_id
  )
  on conflict (registration_id) do nothing;

  return new;
end;
$function$;

commit;
