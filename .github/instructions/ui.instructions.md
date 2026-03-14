---
description: "Use when building UI components, pages, or layouts. Covers component library choices, styling conventions, and React hooks preferences for this project."
applyTo: "src/**/*.tsx"
---

# UI Development Guidelines

## Component Library — Ant Design (antd)

- **Prefer antd components first** for all UI elements: buttons, inputs, selects, modals, tables, forms, notifications, etc.
- Import from `antd` and `@ant-design/icons`; do not install other UI libraries.
- Use `App.useApp()` (or top-level `useApp` from antd's `App` context) to access `message`, `notification`, and `modal` imperatively.
- The root `App.tsx` wraps everything in `<ConfigProvider locale={zhCN}><AntdApp>`, so locale and app context are globally available.

## Styling — Tailwind CSS + antd tokens

- Use Tailwind utility classes for layout, spacing, and responsive design alongside antd components.
- Do **not** write custom CSS for things Tailwind or antd already covers.
- Prefer Tailwind's responsive prefixes (`sm:`, `lg:`) over custom media queries.

## React Hooks — ahooks preferred

- Use [ahooks](https://ahooks.js.org/) (`useRequest`, `useDebounce`, `useLocalStorageState`, etc.) before writing custom hooks for common patterns.
- Use `lodash` for data manipulation utilities; import individual functions (`import debounce from 'lodash/debounce'`) to keep bundles small.

## Path Aliases

- Use `@/` as the alias for `src/`. Example: `import Foo from '@/components/Foo'`.

## Project Structure

```
src/
  router/       # Route definitions (createBrowserRouter)
  layouts/      # Shared page layouts (e.g., MainLayout)
  pages/        # One folder per page/tool (e.g., pages/JsonFormatter/)
  components/   # Shared reusable components
```
