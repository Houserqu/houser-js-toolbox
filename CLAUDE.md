# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # start dev server
pnpm build      # type-check + vite build
pnpm lint       # eslint
pnpm preview    # preview the production build locally
```

No test runner is configured.

## Architecture

React + TypeScript SPA built with Vite, deployed to GitHub Pages at `/houser-js-toolbox/` (the `base` in `vite.config.ts`).

**Stack:** React 19, React Router v7, Ant Design v6, Tailwind CSS v4, ahooks.

**Path alias:** `@/` maps to `src/`.

**UI language:** Chinese (zh-CN locale configured in `App.tsx` via Ant Design `ConfigProvider`).

### Adding a new tool

1. Create `src/pages/<ToolName>/index.tsx` (and any helper modules alongside it).
2. Register the route in `src/router/index.tsx`.
3. Add an entry to the `tools` array in `src/pages/Home/index.tsx`.

### Converter pattern

Tool pages that do pure text conversion (e.g. `SqlToGorm`) keep the conversion logic in a separate `.ts` module next to `index.tsx`. Converters export a `ConvertResult` shape `{ code: string; error?: string }`. The page component debounces input with `useDebounceFn` from ahooks and re-runs immediately on format-switch.
