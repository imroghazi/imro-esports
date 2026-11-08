# IMRO ESPORTS tournament upgrade

This branch starts the tournament upgrade without changing the live `main` branch.

## Included in this first foundation commit

- Additive database migration for player avatar IDs (1–64).
- A 64-choice avatar catalog across the agreed five themes.
- Bracket progression references on matches (`next_match_id`, `next_match_slot`).
- Tournament start/completion fields and a single-/double-elimination format setting.
- Tier-specific scoring rules with editable defaults.
- An auditable points ledger and per-player leaderboard totals.
- Public leaderboard totals are readable only after an admin starts the tournament.
- Realtime publication registration for leaderboard totals when Supabase Realtime is available.

## Important safety note

The SQL migration is committed as a file only. It has **not** been run against the live Supabase database. Apply it only after reviewing it and confirming the current RLS helper and database backup.

## Remaining implementation work

1. Update the registration Edge Function to validate and store avatar IDs.
2. Add avatar selection and random-avatar option to the registration page.
3. Build a deterministic per-tier draw generator with odd players moved to reserves.
4. Build connected bracket rounds and winner advancement.
5. Add admin-confirmed match result RPC with duplicate protection and points-ledger writes.
6. Add admin controls for scoring, promotion approval and manual point adjustments.
7. Add public live leaderboard and bracket views.
8. Test with seeded test data, including 1, 2, 3, 8, 16, 32, 64 and 100+ player scenarios before merging.

Payment collection remains disabled. The existing live registration and player records are not modified by this branch.
