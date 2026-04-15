# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 dashboard for NPS and commercial/sales analytics, built with VisActor charts, TypeScript, Tailwind CSS, and Jotai. Data sources: Google Sheets (NPS) and Kommo CRM (sales). Deployed on Vercel.

## Package Manager

**IMPORTANT**: Always use `pnpm` (v9.3.0+), never `npm` or `yarn`.

## Commands

```bash
pnpm install        # Install dependencies
pnpm dev            # Dev server on http://localhost:3000
pnpm dev -H 0.0.0.0 # Dev server accessible externally (VPS)
pnpm build          # Production build (runs drizzle-kit push first)
pnpm start          # Production server
pnpm lint           # ESLint
pnpm db:generate    # Generate Drizzle migrations
pnpm db:push        # Push schema to NeonDB
pnpm db:studio      # Drizzle Studio (visual DB browser)
```

## Architecture

### Route Structure (App Router)

- `(dashboard)/` — Main dashboard (redirects to /nps)
- `(nps)/nps/` — NPS analytics page (server component, fetches Google Sheets)
- `(comercial)/comercial/` — Sales/pipeline metrics (server component, queries NeonDB)
- `ticket/` — Comments/observations table (server component, fetches Google Sheets)
- `api/nps/`, `api/sheets-data/`, `api/test-sheets/` — API routes (all have try-catch)
- `api/sync/kommo/` — Kommo leads sync endpoint (GET, cron-triggered)
- `api/sync/kommo/events/` — Kommo events sync endpoint (GET, cron-triggered)
- `actions/sheets-actions.ts` — Server actions for NPS data

Navigation is defined in `src/config/site.tsx` — update the `navigations` array when adding routes.

### Provider Hierarchy (`src/app/providers.tsx`)

Outermost → Innermost:
1. **JotaiProvider** — Atomic state (`src/lib/atoms.ts`: `dateRangeAtom`, `ticketChartDataAtom`)
2. **ModeThemeProvider** (next-themes) — Light/dark/system theme, `class` strategy
3. **ChartThemeProvider** — Syncs VisActor themes with mode theme via `ThemeManager.registerTheme()`

### Data FlowPages are **server components** that fetch data directly. No caching (`unstable_noStore()`, `force-dynamic`).

**NPS/Ticket data**: Google Sheets via `getSheetData()` in `src/lib/google-sheets.ts`.

**Comercial data**: NeonDB PostgreSQL via Drizzle ORM. Data is synced from Kommo CRM every 2 hours by Vercel Cron → `api/sync/kommo/`. The `/comercial` page queries the DB directly via `src/lib/kommo-queries.ts`.

**Google Sheets authentication** (two paths in `getGoogleSheetsClient()`):
1. JSON key file at project root (`gen-lang-client-0312769039-f45a7c9ff94b.json`) — used locally
2. Environment variables (`GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`) — used on Vercel

All pages have try-catch error handling that shows a friendly UI when credentials are missing/invalid.

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
- **drizzle-orm** + **@neondatabase/serverless** — DB access (Neon HTTP driver, serverless-optimized)
- **next-themes** — theme switching
- **lucide-react** — icons
- **Shadcn** — UI components in `src/components/ui/`
- **date-fns** — date utilities

## Database (Neon DB)

O banco de dados do projeto é um **Neon Serverless Postgres** (PostgreSQL 17).

- **Projeto**: `neon-aqua-marble` (ID: `floral-scene-73378478`)
- **Organização**: Vercel: theplayzzz's projects (`org-shy-darkness-91367209`)
- **Região**: `aws-sa-east-1`
- **Conexão**: definida em `DATABASE_URL` no `.env`
- **ORM**: Drizzle ORM (`drizzle-orm` + `drizzle-kit`)
- **Driver**: `@neondatabase/serverless`

### Neon CLI (`neonctl`)

O CLI do Neon está instalado globalmente e autenticado. Use-o para gerenciar o banco diretamente pelo terminal.

```bash
# Listar projetos
neonctl projects list --org-id org-shy-darkness-91367209

# Listar branches do projeto
neonctl branches list --project-id floral-scene-73378478

# Obter connection string
neonctl connection-string --project-id floral-scene-73378478

# Listar databases
neonctl databases list --project-id floral-scene-73378478
```

**IMPORTANTE**: Use o **Context7** (MCP) para consultar a documentação atualizada do Neon CLI e descobrir todos os comandos disponíveis. Antes de executar qualquer operação no banco via CLI, consulte a documentação pelo Context7 para garantir a sintaxe correta e entender as opções disponíveis.

### Drizzle ORM

```bash
pnpm db:generate  # Gerar migrations
pnpm db:push      # Push schema para o Neon
pnpm db:studio    # Interface visual (Drizzle Studio)
```

## Kommo CRM Integration

### API Details
- **Base URL**: `https://{URL_KOMMO}/api/v4/`
- **Auth**: Bearer token (`SECRET_KEY_KOMMO` env var — long-lived JWT)
- **Rate limits**: ~7 req/sec, no explicit daily limit
- **Pagination**: max 250 items/page, `page` param, `_links.next` indicates more pages

### Main Pipeline: 8480507 ("FUNIL DE VENDA HUNTER")
- ~13.800 leads total, 12 statuses
- Status 142 = **Closed-won** (venda), Status 143 = **Closed-lost** (perdido)
- Key statuses: PROPECCAO → distribuição → Disparo → SEM RESPOSTA → VIABILIDADE → NEGOCIACAO → AGENDAMENTO → AGENDADO → AGENDADO CONFIRMADO → Closed

### Sync Architecture
- **Sync engine**: `src/lib/kommo-sync.ts` — wall-clock guard (8s) to respect Vercel timeout, cursor persisted in `sync_state` table
- **Initial full sync**: Paginated, ~56 requests. Can run locally via `scripts/initial-sync.ts` (no timeout guard) or incrementally via repeated cron invocations
- **Incremental sync**: Every 2h via Vercel Cron, uses `filter[updated_at][from]=last_sync_timestamp` (~1-5 requests)
- **Events sync**: Separate cron at half-hour mark, syncs `lead_status_changed` events for time tracking
- **Logging**: All sync operations logged to `sync_logs` table (replaces console.* which is banned by ESLint)

### DB Schema (`src/db/schema/`)
- `kommo_leads` — Raw lead data with indexes on status, pipeline, dates
- `kommo_lead_events` — Status change history (for time-between-statuses calculations)
- `kommo_pipeline_statuses` — Pipeline column definitions
- `kommo_users` — User/vendedor mappings
- `kommo_tags` — Tag definitions (key: "Meta ADS", "Link Site Google", "Link Google", "Meta Formulário")
- `sync_logs` — Audit log for all sync operations (supports future Google Ads, Meta Ads sources)
- `sync_state` — Pagination cursor and last-sync timestamps

### Key Tag Groups for Lead Origin
- **Google**: "Link Google" (id=109339), "Link Site Google" (id=101472)
- **Meta**: "Meta ADS" (id=96992), "Meta Formulário" (id=98464)
- **Instagram**: "Link Insta" (id=100246)

### Cron Schedule (`vercel.json`)
- Leads sync: `0 */2 * * *` (every 2h at :00)
- Events sync: `30 */2 * * *` (every 2h at :30)
- Auth: `CRON_SECRET` env var verified in route handlers

## Google Ads Integration (BigQuery DTS)

Métricas de Google Ads vêm do **BigQuery Data Transfer Service** (conta `8091212488`). Não há sync para o Neon — queries são feitas direto no BigQuery a cada page load (`force-dynamic`).

### BigQuery
- **Project**: `gen-lang-client-0312769039`
- **Dataset**: `google_ads_data` em `southamerica-east1`
- **Sync diário**: 02:00 UTC (DTS Config principal)
- **Service Account leitora**: `bigquery-google-ads-reader@gen-lang-client-0312769039.iam.gserviceaccount.com` com roles `BigQuery Data Viewer` + `BigQuery Job User`

### Cliente (`src/lib/bigquery.ts`)
Auth dual igual ao `google-sheets.ts`: arquivo JSON no root em dev (qualquer `gen-lang-client-*.json` que exista) ou env vars `GOOGLE_BIGQUERY_CLIENT_EMAIL` / `GOOGLE_BIGQUERY_PRIVATE_KEY` em prod. Singleton por processo. Helper `getGoogleAdsTable("CampaignStats")` monta nome qualificado a partir de `GOOGLE_BIGQUERY_PROJECT_ID` + `GOOGLE_ADS_BIGQUERY_DATASET` + `GOOGLE_ADS_CUSTOMER_ID`. Sempre usar **named params** (`@start_date`, `@end_date`).

### Queries (`src/lib/google-ads-queries.ts`)
Expõe `getGoogleAdsCampanhasMetrics(start, end)` com a mesma assinatura de `getCampanhasMetrics` (Meta), retornando `CampanhasMetrics` em `src/types/campanhas.ts`.

Mapeamentos:
- `metrics_cost_micros / 1e6` = spend em BRL
- `metrics_conversions` = proxy de "leads"; UI mostra "Conversões"/"CPA" no modo Google
- `reach`, `frequency`, mensageria e rankings são **zerados** (não existem em Google Ads)
- `campaign_name` = `campaign_id` enquanto a entity table `p_ads_Campaign_8091212488` não popula (entity tables só vêm pelo sync diário, não pelo backfill)
- `lastExtractedAt` = `MAX(_PARTITIONTIME)` da tabela de stats

### UI
Dashboard `/campanhas` tem tabs Meta/Google. Param `?platform=meta|google` (default `meta`). Date picker preserva platform. Componente `CampanhasView` renderiza ambas as plataformas a partir do mesmo tipo `CampanhasMetrics`.

## Environment Setup

Copy `.env.example` to `.env` and fill in credentials. Required env vars:

- **Google Sheets**: `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID` (or JSON key file at project root)
- **NeonDB**: `DATABASE_URL`
- **Kommo CRM**: `URL_KOMMO`, `SECRET_KEY_KOMMO`
- **Google Ads / BigQuery**: `GOOGLE_BIGQUERY_PROJECT_ID`, `GOOGLE_BIGQUERY_CLIENT_EMAIL`, `GOOGLE_BIGQUERY_PRIVATE_KEY`, `GOOGLE_ADS_CUSTOMER_ID`, `GOOGLE_ADS_BIGQUERY_DATASET` (or JSON key `gen-lang-client-*.json` no root em dev)
- **Cron auth**: `CRON_SECRET`
