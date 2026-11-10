# IMRO ESPORTS — Native App

A real React Native + Expo application for Android and iOS. This app is intentionally separate from the existing web deployment and connects to the existing production Supabase project.

## Identity
- Display name: IMRO ESPORTS
- Android application ID: com.imroesports.app
- iOS bundle identifier: com.imroesports.app
- Runtime: Expo SDK 58 / React Native / TypeScript
- Backend: existing Supabase project (configured through environment variables)

## Architecture
- `app/`: native application entry and screens
- `src/lib/`: Supabase client and data access
- `src/features/`: player, tournament, match, payment and admin feature modules
- `src/theme/`: IMRO design tokens
- `src/types/`: shared domain types

## Data safety
The app is a client of the existing production database. It must not create replacement player, registration, tournament or match records just to mirror website data. Do not run destructive SQL or change production policies as part of mobile setup. Use the existing table IDs and relationships. Admin operations must be protected by existing server-side authorization and RLS.

## Local setup
1. Install Node.js 22.13+.
2. Copy `.env.example` to `.env` and fill in the existing Supabase project URL and publishable key.
3. Run `npm install`.
4. Run `npx expo start`.

Use a development build for native modules and production testing. EAS Build will produce Android and iOS binaries after app configuration and credentials are ready.

## Security
Only a Supabase publishable key belongs in the mobile client. Never place a service-role/secret key in this repository, app config, or a mobile environment variable.
