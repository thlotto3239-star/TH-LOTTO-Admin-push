# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

**TH-LOTTO Admin Panel** — the back-office web app for managing a Thai lottery platform. Deployed at https://th-lotto-admin.vercel.app (Vercel project ID: `prj_Un7pZtGDhtaxXOGaOXDajtLDpPWM`, branch `master`).

There is a **separate** User App repo (`thlotto3239-star/thlotto-premium`) that shares the same Supabase database but has entirely separate code and RPC functions. Never mix code between the two repos.

---

## Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server (Vite)
npm run build        # production build
npm run preview      # preview production build locally
```

There is no test runner or linter configured — no `npm test` or `npm run lint` exists.

**Deploy** (after committing):
```bash
git push origin master
npx vercel --prod --yes
```
Always verify the live site after deploying. After any functional change, update `CHANGELOG.md` and `PROJECT_STATUS.md`, then commit and push those too.

**Environment variables** — copy `.env.example` and fill in:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
These must also exist in the Vercel project's environment settings before deploying.

---

## Architecture

### Stack
- **React 19** + **Vite 6** + **Tailwind CSS 3**
- **Supabase** (PostgreSQL + Auth + Realtime)
- **React Router DOM 7** (client-side routing)
- **Lucide React** (page-level icons) + **Google Material Symbols** (sidebar icons via CDN)
- **Recharts** (charts on Dashboard)
- **date-fns** (Thai locale date formatting)

### Auth Flow
Login uses phone + PIN. The PIN is SHA-256 hashed as `SHA256(pin + phone)` and used as the password for a synthetic email `{phone}@thlotto.app`. Supabase Auth handles the session. **Never change this hashing scheme** — it must stay in sync with the User App.

After sign-in, `AuthContext` fetches the user's row from the `profiles` table and checks `is_admin = true`. Non-admins are signed out immediately.

### Permission System
`AuthContext` exposes `hasPermission(perm)` and `isSuperAdmin()`. Permission keys match route names (`deposits`, `withdrawals`, `members`, `markets`, `bets`, `restricted`, `wheel`, `settings`, `appearance`, `sliders`, `promotions`, `articles`, `banks`). The `super_admin` role bypasses all permission checks. Other roles check the `admin_permissions` array in their profile row.

In `App.jsx`, most routes are wrapped in `<PermGuard perm="...">` which redirects to `/` on failure. The Instant Lottery section (`/instant-*`) is intentionally unrestricted (`perm: null`).

### Context Providers (wrapping order in `main.jsx`)
1. `AuthProvider` — user session, profile, permission helpers
2. `ModalProvider` — global imperative modal (call `useModal()` → `showConfirm`, `showError`, etc.)
3. `BrowserRouter` → `Suspense` → `Routes`

### Toast System
`Toast.jsx` uses a **module-level singleton** pattern: `initToast(setter)` is called once in `Layout.jsx`, then any file can call `toast.success(message)` / `toast.error(message)` etc. without prop-drilling. Import `{ toast }` from `../components/Toast`.

### Database Access Pattern
All significant data operations go through **Supabase RPC functions** prefixed `admin_*`. Direct table queries (`.from(...).select(...)`) are used only for simple reads (e.g., fetching `settings`, `profiles`). Always match frontend field names exactly to the RPC return columns — mismatches are the most common source of bugs.

### Shared Database Tables
Key tables shared with the User App: `profiles`, `wallets`, `transactions`, `deposit_requests`, `withdraw_requests`, `lottery_markets`, `lottery_results`, `bets`, `payout_rates`, `draw_schedules`, `restricted_numbers`, `settings`, `lucky_wheel_spins`, `lucky_wheel_prizes`, `admin_notifications`.

Instant Lottery tables: `instant_bet_types`, `instant_draws`, `instant_bets`.

### Two Lottery Systems
- **Main Lottery** (`/markets`, `/results`, `/bets`, `/restricted`) — 21 markets, drawn on schedules.
- **Instant Lottery** (`/instant-*`) — "1-minute lottery", entirely separate tables and RPCs. These systems must not be mixed.

### Realtime Notifications
`Layout.jsx` subscribes to the `admin_notifications` table via Supabase Realtime on mount. New rows trigger a toast-style in-header bell notification. The `admin_notifications` table is populated by PostgreSQL triggers on `deposit_requests`, `withdraw_requests`, `lottery_results`, and `profiles` inserts (see `supabase/migrations/001_admin_notifications.sql`).

### Design System
Tailwind is configured with a **Material Design 3-inspired token palette** (see `tailwind.config.js`). Use token names like `bg-primary`, `text-on-surface-variant`, `bg-error-container`, etc. — never raw hex values. The font is **Prompt** (Thai-optimized). Border radii are overridden to rounder values (`rounded-xl` = `3rem`, `rounded-full` = `9999px`). The UI style is glassmorphic (frosted sidebar, floating pill header).

### `__APP_VERSION__`
Vite injects `package.json` version as the global `__APP_VERSION__` at build time. Bump `package.json` `"version"` when releasing a new version.

---

## Forbidden Changes

- Do not alter the SHA-256 PIN→password auth scheme.
- Do not deploy to a different Vercel project (must stay `prj_Un7pZtGDhtaxXOGaOXDajtLDpPWM`).
- Do not drop or rename database columns/tables without checking all RPC and frontend references first.
- Do not rewrite RPC-calling functions without preserving exact field names from the RPC response.
- Do not touch the User App (`thlotto-premium`) from this repo.
