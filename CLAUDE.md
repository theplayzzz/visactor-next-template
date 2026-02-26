# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 dashboard for NPS (Net Promoter Score) analytics, built with VisActor charts, TypeScript, Tailwind CSS, and Jotai. Data is fetched from Google Sheets. Deployed on Vercel.

## Package Manager

**IMPORTANT**: Always use `pnpm` (v9.3.0+), never `npm` or `yarn`.

## Commands

```bash
pnpm install        # Install dependencies
pnpm dev            # Dev server on http://localhost:3000
pnpm dev -H 0.0.0.0 # Dev server accessible externally (VPS)
pnpm build          # Production build
pnpm start          # Production server
pnpm lint           # ESLint
```

## Architecture

### Route Structure (App Router)

- `(dashboard)/` — Main dashboard (redirects to /nps)
- `(nps)/nps/` — NPS analytics page (server component, fetches Google Sheets)
- `ticket/` — Comments/observations table (server component, fetches Google Sheets)
- `api/nps/`, `api/sheets-data/`, `api/test-sheets/` — API routes (all have try-catch)
- `actions/sheets-actions.ts` — Server actions for NPS data

Navigation is defined in `src/config/site.tsx` — update the `navigations` array when adding routes.

### Provider Hierarchy (`src/app/providers.tsx`)

Outermost → Innermost:
1. **JotaiProvider** — Atomic state (`src/lib/atoms.ts`: `dateRangeAtom`, `ticketChartDataAtom`)
2. **ModeThemeProvider** (next-themes) — Light/dark/system theme, `class` strategy
3. **ChartThemeProvider** — Syncs VisActor themes with mode theme via `ThemeManager.registerTheme()`

### Data Flow

Pages are **server components** that fetch data directly from Google Sheets via `getSheetData()` in `src/lib/google-sheets.ts`. No caching (`unstable_noStore()`, `force-dynamic`).

**Google Sheets authentication** (two paths in `getGoogleSheetsClient()`):
1. JSON key file at project root (`gen-lang-client-0312769039-f45a7c9ff94b.json`) — used locally
2. Environment variables (`GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`) — used on Vercel

NPS and Ticket pages have try-catch error handling that shows a friendly UI when credentials are missing/invalid.

### Chart Component Pattern

All charts live in `src/components/chart-blocks/charts/{name}/`:
- `index.tsx` — Server wrapper (layout, title)
- `chart.tsx` — Client component (`"use client"`) with VChart

**Critical**: Every chart component must:
1. Use `useHydration()` hook and return `null` until hydrated (prevents SSR mismatch)
2. Be marked `"use client"`

Custom chart themes: `src/config/chart-theme.ts` (light/dark, synced via `ChartThemeProvider`).

### Styling

- Tailwind CSS with HSL color variables in `src/style/globals.css`
- Dark mode via `class` strategy
- Custom breakpoints: `phone` (370px), `tablet` (750px), `laptop` (1000px), `desktop` (1200px)
- Font: Gabarito (Google Fonts, CSS var `--font-gabarito`)
- Chart colors: `--chart-1` through `--chart-5`

## Code Style

### ESLint
- **No `console.*`** — will error
- **Inline type imports** — `import { type Foo }` not `import type { Foo }`
- **Unused vars** — prefix with `_` (e.g., `_unused`)

### Prettier
- 80 char width, 2 spaces
- Import order: `server-only` → external packages → `@/*` aliases → relative (`./`, `../`)
- Tailwind classes auto-sorted

## Key Dependencies

- **React 19 RC** — check compatibility before adding packages
- **@visactor/vchart** + **@visactor/react-vchart** (v1.12.10+)
- **jotai** — state management
- **googleapis** — Google Sheets data fetching
- **next-themes** — theme switching
- **lucide-react** — icons
- **Shadcn** — UI components in `src/components/ui/`
- **date-fns** — date utilities

## Environment Setup

Copy `.env.example` to `.env` and fill in Google Sheets credentials, OR place the JSON key file at the project root. The JSON file takes priority. Both are in `.gitignore`.
