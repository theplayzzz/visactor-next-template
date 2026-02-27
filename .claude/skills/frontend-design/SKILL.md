---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI. Generates creative, polished code and UI design that avoids generic AI aesthetics.
allowed-tools: Read, Grep, Glob, Bash(pnpm *), Edit, Write
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Project Stack & Constraints

This project uses a specific tech stack. ALWAYS respect these constraints:

- **Framework**: Next.js 15 (App Router) with React 19 RC
- **Styling**: Tailwind CSS with HSL CSS variables (defined in `src/style/globals.css`)
- **UI Library**: Shadcn/ui components in `src/components/ui/`
- **Charts**: @visactor/vchart + @visactor/react-vchart (NOT recharts, NOT chart.js)
- **Icons**: lucide-react (NOT heroicons, NOT font-awesome)
- **Font**: Gabarito (Google Fonts, CSS var `--font-gabarito`) - this is the project's distinctive font
- **State**: Jotai atoms (`src/lib/atoms.ts`)
- **Theme**: next-themes with `class` strategy (light/dark/system)
- **Package Manager**: pnpm (NEVER npm or yarn)

### Color System (HSL CSS Variables)
```css
/* Light */
--primary: 225 100% 50%;        /* Bold blue */
--chart-1: 12 76% 61%;          /* Warm orange */
--chart-2: 173 58% 39%;         /* Teal */
--chart-3: 197 37% 24%;         /* Deep blue */
--chart-4: 43 74% 66%;          /* Gold */
--chart-5: 27 87% 67%;          /* Amber */

/* Dark */
--chart-1: 220 70% 50%;
--chart-2: 160 60% 45%;
--chart-3: 30 80% 55%;
--chart-4: 280 65% 60%;
--chart-5: 340 75% 55%;
```

Use `hsl(var(--variable))` in Tailwind classes: `bg-primary`, `text-muted-foreground`, etc.

### Custom Breakpoints
- `phone`: 370px
- `tablet`: 750px
- `laptop`: 1000px
- `desktop`: 1200px

### Chart Component Pattern

Every chart component MUST:
1. Be in `src/components/chart-blocks/charts/{name}/`
2. Have `index.tsx` (server wrapper) and `chart.tsx` (client component with `"use client"`)
3. Use `useHydration()` hook and return `null` until hydrated (prevents SSR mismatch)

### Component Guidelines
- Prefer extending/composing existing Shadcn components over building from scratch
- Use `cn()` utility from `src/lib/utils.ts` for conditional class merging
- Server components by default; only add `"use client"` when needed (interactivity, hooks)
- All pages are server components that fetch data directly

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: The project uses Gabarito as its primary font. Within that constraint, play with font weights, sizes, letter-spacing, and text transforms to create hierarchy and visual interest. Use `font-gabarito` class. For code/data, consider monospace accents.
- **Color & Theme**: Work within the established HSL variable system. Create depth through opacity variations (`/80`, `/60`, `/40`), gradients using chart colors, and layered backgrounds. Both light and dark themes must look polished. Use CSS variables for consistency.
- **Motion**: Use Tailwind's `animate-*` utilities and `transition-*` classes. For complex animations, use CSS `@keyframes` in globals.css. Focus on high-impact moments: staggered reveals on page load, smooth hover states, and scroll-triggered animations. Consider `framer-motion` for React components when Tailwind utilities aren't enough.
- **Spatial Composition**: Use Tailwind's grid and flexbox utilities creatively. Asymmetric layouts, overlapping elements with `relative`/`absolute` positioning, generous `gap` values. Break the monotony of uniform card grids.
- **Backgrounds & Visual Details**: Create atmosphere with gradient meshes, subtle noise textures, geometric patterns. The project has a `dot-matrix.css` pattern available. Use `backdrop-blur`, layered transparencies, and creative border treatments. Shadow depth with `shadow-sm` through `shadow-2xl`.
- **Data Visualization**: Charts are a core part of this dashboard. Make chart containers visually interesting - custom headers, contextual stats, meaningful empty states. Use the chart color palette consistently.

## Anti-Patterns (NEVER do these)

- Generic AI aesthetics: overused fonts (Inter, Roboto, Arial), cliched purple gradients, predictable grid layouts
- Cookie-cutter cards with no visual hierarchy
- Flat, lifeless data displays with no breathing room
- Ignoring dark mode (every component must work in both themes)
- Using libraries not in the project stack (no recharts, no heroicons, no styled-components)
- Creating components that don't follow the established patterns (missing `useHydration()` in chart components, missing `"use client"` directives)
- Using `npm` or `yarn` instead of `pnpm`

## Creative Direction

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No two designs should be the same. Vary between light and dark themes, different weight distributions, different spatial compositions.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate Tailwind compositions with extensive animations. Minimalist designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back - show what can truly be created when thinking outside the box and committing fully to a distinctive vision. Push the boundaries of what a dashboard can look like while keeping it functional and data-readable.
