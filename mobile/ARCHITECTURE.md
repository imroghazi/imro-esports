# IMRO ESPORTS mobile architecture

## Product shape
One native React Native application for Android and iOS. Player and administrator experiences are selected from the authenticated user's trusted server-side role. The mobile client never grants itself admin privileges.

## Layers
1. **Native presentation** — screens, navigation, accessibility, device safe areas and platform behavior.
2. **Feature modules** — auth, player identity, tournaments, registration, draws, matches, results, receipts, rankings and notifications.
3. **Application services** — typed repositories, validation, realtime subscriptions, push-token registration and error handling.
4. **Backend** — the existing Supabase project and its Postgres tables, Auth, RLS and Realtime.

## Existing production data contract (read before changing)
- `tournaments`: tournament identity and registration state
- `registrations`: existing player sign-ups and registration tokens
- `players`: approved player identity, tier and status
- `draws` + `matches`: published/draft draws and match progression
- `reserve_players`: reserve queue
- `promotion_history`: tier promotion audit trail
- `payment_receipts`: admin-created transaction receipts and status
- `admins`: administrator membership
- Squad features: `squad_tournament_settings`, `squad_registrations`, `squad_members`, `squad_public_teams`, `squad_matches`, `squad_match_results`, `squad_winner_announcements`, `squad_announcement_winners`, `squad_payments`
- Match alerts: `player_match_alerts`, `player_match_alert_responses`
- Settings: `tournament_settings`, `tournament_tier_controls`, `prize_settings`

These tables already contain live data. The app must query and update the existing records through the existing authorization rules; never seed duplicates or migrate/copy player identities.

## Security boundaries
- Only the Supabase project URL and publishable key are allowed in the app.
- Never ship a service-role or secret key.
- Admin authorization must be verified from trusted server-side state and enforced by RLS/database functions, not user-editable profile metadata or UI-only checks.
- Keep registration/payment/match writes behind existing RLS and verified workflows.
- No production schema or policy changes during initial client setup.

## Realtime and offline behavior
Subscribe only to the minimum tables needed by the visible screen. Remove subscriptions on unmount and refresh stale data after reconnect. Cache display-only data where appropriate; never treat offline cached values as authoritative for registration, payment, draw or match writes.

## Release
Use EAS development builds for native testing, then separate internal Android/iOS builds, store review, and production release. Keep the existing Vercel website deployment on `main` untouched while this work proceeds on `native-app-foundation`.
