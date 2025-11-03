# Code Generation Rules for Next.js + TypeScript (App Router Compatible)

## 🧑‍💻 Project Context

- **Framework**: Next.js (App Router-based routing using `app/` directory)
- **Language**: TypeScript
- **Routing Strategy**: Use `app/` directory with static and dynamic routes.
- **Constraints**:
  - ⚠️ Code should blend into an existing live project. DO NOT modify existing CSS, project structure, or global behavior.

---

## ✅ General Code Generation Principles

- Produce clean, modular, and scalable code following frontend best practices.
- Code must align with the existing project structure and naming conventions.
- Generated code should be logically strong, maintainable, and avoid redundancy.
- New code **must not disrupt** the existing layout or styles.

---

## ✅ Project Structure Rules (App Router)

- Use `app/` directory for routing with segment folders and `page.tsx`, `layout.tsx`, and `loading.tsx`.
- Create shared components under `components/`, scoped and reusable.
- Use **kebab-case** for filenames and directories (e.g., `hero-section.tsx`).
- Co-locate components or templates if they belong to specific route segments.
- **component name** should be in **Pascal case**

---

## ✅ Next.js (App Router) Standards

- Use `next/image` for image optimization.
- Use `next/link` for direct internal navigation.
- Use `next/navigation` for functional navigation.
- Avoid inline styles — use CSS Modules, SCSS, or styled-components.
- Leverage built-in layouts for consistency across routes.

---

## ✅ TypeScript Practices

- Use strict typing with `interface` or `type` for props and server data.
- Avoid `any` unless explicitly justified.
- Use `camelCase` for variables and functions.
- Prefer `undefined` over `null`
- Use `===` and `!==` strictly.
- End all lines with semicolons.
- Use double quotes (`"`) for all string literals.

---

## ✅ CSS and Styling Rules

- Do not modify existing global styles or reset files.
- Use CSS Modules or SCSS in `*.module.css` files for component styles.
- Styles must be scoped — avoid global overrides unless intentional.
- Place component styles next to the component file for maintainability.
- Do not use inline styles unless required for conditional logic.

---

## ✅ Routing & Navigation

- Use folders as route segments (`app/about/page.tsx` becomes `/about`).
- Use `layout.tsx` to share structure (e.g., header, footer) across routes.
- Use `next/link` for client navigation, never `<a>` directly.
- Support static generation with `generateStaticParams()` for dynamic routes.
<!-- - Avoid client-side fetching unless necessary — prefer server components. -->

---

## ⚙️ Component Guidelines

- Prefer server components unless interaction or state is required.
- Use client components with `"use client"` only where necessary.
- Components must accept well-typed props and support optional defaults.
- Avoid unnecessary `<div>` wrappers; use fragment shorthand when possible.
- Components should be co-located when relevant to the route.

---

## 🚫 Forbidden Features

- ❌ Do not use:
  - `next/api`, old `pages/` directory
  - Global state libraries unless already part of the project
  - Context API, Redux, Zustand unless specified
  - Inline scripts or deprecated lifecycle hooks
  - Class components or legacy patterns from `pages/` routing

---

## 🔄 Code Sync Requirements

- Do not interfere with:
  - Existing `globals.css`, `tailwind.config.js`, or `_document.tsx` if present
- Match existing conventions (layout structure, imports, naming, etc.)
- Ensure generated code plugs cleanly into existing segments without breaking layout or logic.

```

```
