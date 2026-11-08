# IMRO ESPORTS tournament upgrade

This work is isolated on `feature/tournament-upgrade`. Production `main`, the live website, and live Supabase data have not been changed.

## Implemented on the development branch

- Additive migration foundation for registration/player avatar IDs, tournament lifecycle, and linked match progression.
- 64 unique avatar catalog entries across the requested themes.
- Avatar-aware registration page and Edge Function source (not deployed).
- Existing registration-to-player trigger is updated in the migration to copy avatar IDs.
- Pure random single-elimination bracket planner with odd-player reserve handling and automatic bye placement.
- Admin-triggered random per-tier draft bracket generation; results stay unpublished until admin publishes.
- Admin controls for starting a tournament, configuring tier scoring, and confirming winners through an admin-only database RPC.
- Winner progression links, points ledger, champion/runner-up/promotion bonus logic, and leaderboard totals.
- Public leaderboard RPC and live refresh subscription; leaderboard rows are seeded at tournament start.
- CI workflow for bracket tests, HTML inline-script syntax checks, feature wiring checks, and migration safety/catalog checks.

## Automated test results

Latest GitHub Actions run: **passed**.
- 8 bracket-engine tests passed, 0 failed.
- Inline JavaScript syntax checks passed for `index.html`, `dashboard.html`, and `admin.html`.
- Feature wiring and migration static checks passed.
- Test cases include odd/even counts, reserve handling, duplicate/missing IDs, valid random source, linked next-round slots, and exactly-once initial player placement. Tested counts include 2 through 100 players, plus odd counts through 101.

## Not yet integration-tested

- The SQL migration has **not** been applied to any Supabase database.
- The updated registration Edge Function has **not** been deployed.
- Database RPCs, RLS, Realtime delivery, and browser-to-database flows still need an isolated Supabase test database.
- The new frontend has not been deployed to Vercel or tested against the live domain.
- Payment collection remains disabled.

## Next steps before production approval

1. Obtain an isolated Supabase test environment and apply the migration there.
2. Exercise registration, token creation, avatar persistence, and trigger behavior with test records.
3. Generate 1/2/3/8/16/32/64/100-player brackets for each tier and verify reserves, byes, and every next-match link.
4. Test admin-only start/result/points RPCs, duplicate result rejection, promotion bonuses, and public leaderboard gating/realtime.
5. Fix every failure and repeat the tests.
6. Ask for separate approval before merging to `main`, applying the production migration, or deploying the live site.
