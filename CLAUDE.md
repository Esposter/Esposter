# CLAUDE.md

## Repository Overview

**Project**: Esposter
**Description**: A comprehensive social platform monorepo ("A nice and casual place for posting random things").
**Architecture**: Monorepo using pnpm workspaces and Lerna for package management.
**Language**: TypeScript (Strict Mode)
**Runtime**: Node.js `^24.13.0`
**Package Manager**: pnpm `^10.28.1` (with Catalog protocol)

## Technology Stack

- **Framework**: Nuxt 4 (Beta/RC)
- **UI Library**: Vue 3.5+
- **Build System**: Vite, Rolldown
- **Styling**: UnoCSS (Attributify Mode), Vuetify 3, Sass
- **State Management**: Pinia
- **API**: tRPC, Nuxt Server Routes
- **Database**: Drizzle ORM (PostgreSQL), Azure Table Storage, Azure Blob Storage
- **Server**: Azure Functions (Serverless)
- **Testing**: Vitest
- **Linting**: Oxlint + ESLint

## Monorepo Structure

| Package Path               | Description                                                        |
| :------------------------- | :----------------------------------------------------------------- |
| `packages/app`             | Main Nuxt 4 web application (frontend, server routes, tRPC)        |
| `packages/azure-functions` | Serverless backend (Azure Event Grid, Timers, HTTP)                |
| `packages/db-schema`       | Source of truth for DB: Drizzle ORM schemas, migrations            |
| `packages/db`              | Database connection logic                                          |
| `packages/shared`          | Shared TypeScript types, utilities, constants                      |
| `packages/configuration`   | Shared config (TSConfig, ESLint, Prettier)                         |
| `packages/vue-phaserjs`    | Phaser game engine Vue integration                                 |
| `packages/azure-mock`      | Mock Azure services for local dev/testing                          |

## Development Workflow

- **Start Dev Server**: `pnpm dev` (root) or `pnpm start`
- **Build All**: `pnpm build`
- **Barrel Files**: `pnpm export:gen` in specific packages (uses `ctix`)
- **DB Migrations**: `pnpm db:gen` then `pnpm db:up` (from `packages/db-schema`)

## Coding Conventions

### TypeScript

- Strict mode (`strictTypeChecked`). `any` is **BANNED**.
- `Omit` is **BANNED** — use `Except` from `type-fest`.
- Non-null assertions (`!`) are **BANNED** — use optional chaining or guard clauses.
- `.forEach()` is **BANNED** — use `for...of`.
- Always use named imports from libraries.
- Explicitly type variables with proper types.

### Control Flow

- **Guard clauses first**: prefer `if (!condition) return` over nesting.
- **Always use `if/else if/else` from the very first branch** when a function has multiple conditional returns — no standalone `if` followed by `else if`.

### File & Folder Organisation

- **One function per file** — each exported function lives in its own file.
- **One class per file** — classes belong in a `models/` folder (e.g., `app/models/`, `shared/models/`).
- **Constants go in `constants.ts`** — all module-level constants in a `constants.ts` file alongside the files that use them.
- **Generic browser utilities** go in `app/utils/` (e.g., `readFileAsText.ts`).
- **Feature folders**: related models/services/components are grouped under a feature subfolder (e.g., `tableEditor/file/`).

### Inline Functions

- **Inline arrow functions** where argument types can be inferred from context — don't extract single-use, trivially-typed lambdas into named functions.
- **`defineModel`**: don't pass `{ default: false }` for booleans — omit the options entirely (`defineModel<boolean>()`).
- **No abbreviated parameter names** — use full descriptive names (e.g. `event` not `e`, `column` not `col`). Exception: simple iteration callbacks where the meaning is obvious from context (e.g. `.filter((row, index) => ...)`).


### Styling (UnoCSS Attributify Mode — MANDATORY)

- Use prop-based styling: `<div text-red p-4>` for ALL static styles.
- Use `flex` not `d-flex`.
- Use `size` attribute (or `width`/`height` props) instead of `w-<n>` / `h-<n>` where possible.
- Only use `class="..."` when technically required (dynamic `:class` bindings, external component limits).

### Line Endings

- All files must use **LF** line endings (`\n`), not CRLF.
- After creating files on Windows, run `sed -i 's/\r$//' <file>` to strip CR.

### Vue / Formatting

- `<script setup lang="ts">` at the top of every SFC.
- Always use `lang="scss"` in Vue `<style>` blocks.
- Use self-closing tags for components/elements without content: `<Component />`.
- No blank lines within Vue templates.
- No blank lines between `const` assignments — group them tightly together.
- Remove comments — make variable names descriptive instead.
- Minimise blank lines; group related code tightly.

### Resource Management

- Always clean up in `onUnmounted`: intervals, timeouts, animation frames, event listeners.
- Prefer `VueUse` composables over manual event listeners where possible.

### Immutability (CRITICAL)

- NEVER mutate arrays/objects directly — always create new ones:
  ```typescript
  // WRONG
  items.push(newItem)
  // CORRECT
  const updated = [...items, newItem]
  ```
