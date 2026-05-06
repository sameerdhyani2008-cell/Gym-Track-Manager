# The Track — Gym Manager

A React Native + Expo mobile app for managing gyms — owners and trainers can track members, attendance, revenue, plans, and more. All data stored locally via AsyncStorage.

## Run & Operate

- Mobile: restart `artifacts/mobile: expo` workflow to start the Expo dev server
- API: `pnpm --filter @workspace/api-server run dev` — API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Required env: `DATABASE_URL` — Postgres connection string (API only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54, expo-router (file-based routing), React Native 0.81
- State: React Context (AuthContext, ThemeContext) + AsyncStorage
- UI: React Native StyleSheet, @expo/vector-icons (Ionicons), Inter font
- Charts: react-native-chart-kit + react-native-svg
- Calendar: react-native-calendars
- Photos: expo-image-picker (base64 storage)
- API: Express 5, PostgreSQL + Drizzle ORM

## Where things live

- `artifacts/mobile/` — Expo app
  - `app/` — expo-router screens
    - `(owner)/` — owner tab layout + screens (dashboard, members, attendance, revenue, trainers, plans, settings, subscription, more)
    - `(trainer)/` — trainer tab layout + screens (attendance, members, settings)
    - `welcome.tsx`, `login.tsx`, `signup.tsx`, `forgot-password.tsx` — auth screens
  - `context/AuthContext.tsx` — session + gym state
  - `context/ThemeContext.tsx` — dark mode (AsyncStorage persisted)
  - `store/index.ts` — all AsyncStorage CRUD functions
  - `types/index.ts` — TypeScript types (Gym, Member, Trainer, Plan, etc.)
  - `constants/colors.ts` — light + dark theme tokens
- `artifacts/api-server/` — Express backend (health check only)
- `lib/api-spec/openapi.yaml` — OpenAPI spec

## Architecture decisions

- All gym data stored in AsyncStorage with keys `gym_app_gyms_v1` and `gym_app_session_v1`
- Gym IDs are auto-generated from owner initials + phone digits + city last char (e.g., JS3210I)
- Trainer IDs format: TR + name initials + gym ID prefix + 2 random digits
- ThemeContext defaults to dark mode (matches original web app's dark-first design)
- No backend required — fully offline-first mobile app
- Owner and trainer share the same gym data; separate layouts handle role-based access

## Product

- Owner: Create gym, manage members (add/extend/cancel), track daily attendance, record revenue & expenses, manage trainers and membership plans, view dashboard with stats and footfall chart (Pro)
- Trainer: Mark attendance, view/add members, manage appearance

## User preferences

- Must be a 1:1 conversion from the web app — no new features
- Android 9+ (API 28), iOS 12+
- Dark background #09090b as default, primary accent indigo #6366f1
- No shadcn/ui, no Tailwind — React Native StyleSheet throughout

## Gotchas

- react-native-calendars and react-native-chart-kit are installed in the mobile package
- expo-image-picker stores photos as base64 data URIs
- ThemeContext must wrap app before AuthContext reads AsyncStorage
- Do NOT restart the mobile workflow for code changes — Expo HMR handles those

## Pointers

- See the `pnpm-workspace` skill for workspace structure
- See the `expo` skill for Expo conventions
