# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 dashboard template built with VisActor charts, TypeScript, Tailwind CSS, and Jotai state management. It features a responsive design with dark/light mode support and data visualization components.

## Package Manager

**IMPORTANT**: This project uses `pnpm` as the package manager (version 9.3.0+). Always use `pnpm` commands, not `npm` or `yarn`.

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (runs on http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Architecture

### App Structure

- **App Router**: Uses Next.js 15 App Router with route groups
  - `(dashboard)` route group contains the main dashboard page
  - Separate `/ticket` route for ticket management
  - Root layout at [src/app/layout.tsx](src/app/layout.tsx) includes SideNav and Providers wrapper

### Provider Hierarchy

The app uses a nested provider structure (see [src/app/providers.tsx](src/app/providers.tsx)):
1. **JotaiProvider** - Global state management
2. **ModeThemeProvider** - Handles light/dark/system theme switching (next-themes)
3. **ChartThemeProvider** - Synchronizes VisActor chart themes with mode theme

### Chart Theme System

**Critical**: VisActor charts require special theme synchronization (see [src/components/providers/chart-theme-provider.tsx](src/components/providers/chart-theme-provider.tsx)):
- Uses `ThemeManager.registerTheme()` to register custom light/dark themes on mount
- Automatically syncs chart themes with system/mode theme changes
- Custom themes defined in [src/config/chart-theme.ts](src/config/chart-theme.ts)
- Font extracted from CSS variable `--font-gabarito` and applied to chart themes

### Chart Component Pattern

All chart components follow this structure:
```
src/components/chart-blocks/charts/{chart-name}/
├── index.tsx        # Wrapper component with title and layout
├── chart.tsx        # VChart component with data and spec
└── ...
```

- Data files stored in `src/data/{chart-name}.ts`
- Chart wrapper handles layout and title (using ChartTitle component)
- Inner `chart.tsx` uses `useHydration()` hook to prevent SSR issues with VChart
- Charts must use the `useChartTheme()` hook and pass theme to VChart

### Configuration

- **Site config**: [src/config/site.tsx](src/config/site.tsx) contains navigation structure and site metadata
- **Chart themes**: [src/config/chart-theme.ts](src/config/chart-theme.ts) defines custom VisActor themes
- **Path alias**: `@/*` maps to `src/*` (configured in tsconfig.json)

### Styling

- Uses Tailwind CSS with custom color variables defined in [src/style/globals.css](src/style/globals.css)
- Dark mode handled via `class` strategy (see tailwind.config)
- Custom font: Gabarito from Google Fonts

## Code Style

### ESLint Rules
- **No console statements**: Use proper logging or remove console calls
- **Consistent type imports**: Use `import { type Foo }` for type-only imports
- **Unused vars**: Prefix with `_` to ignore (e.g., `_unusedVar`)

### Prettier Configuration
- Import order enforced with specific grouping:
  1. `server-only`
  2. External packages (e.g., `@visactor/*`, `next/*`)
  3. Internal aliases (`@/*`)
  4. Relative imports (`./`, `../`)
- Automatically sorts Tailwind classes
- 80 character line width, 2 space indentation

## Key Dependencies

- **@visactor/vchart** & **@visactor/react-vchart**: Chart library (v1.12.10+)
- **jotai**: Atomic state management
- **next-themes**: Theme switching with system preference support
- **lucide-react**: Icon library
- **Shadcn components**: Pre-built UI components in `src/components/ui/`

## Important Notes

- This project uses React 19 RC - ensure compatibility when adding new dependencies
- Chart components must handle hydration carefully using `useHydration()` hook
- When adding new routes, consider using route groups for layout inheritance
- Navigation items are configured in [src/config/site.tsx](src/config/site.tsx) - update both the `navigations` array and add corresponding routes
