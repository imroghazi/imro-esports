-- IMRO ESPORTS: archive players instead of hard-deleting tournament records.
-- Applied to the live Supabase project; safe to re-run.
alter table public.players
  add column if not exists archived_at timestamptz;

-- Admin dashboard filters players.archived_at IS NULL.
-- Registrations already have archived_at and are archived together.
-- Match and promotion foreign keys remain intact for historical results.