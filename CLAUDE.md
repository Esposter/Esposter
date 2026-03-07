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

- **Guard clauses first**: always use `if (!condition) return` to exit early instead of wrapping the main body in an `if` block. Reduce nesting aggressively — if the body of an `if` is the rest of the function, invert the condition and return early instead.
- **Always use `if/else if/else` from the very first branch** when a function has multiple conditional returns — no standalone `if` followed by `else if`.

### File & Folder Organisation

- **One export per file** — each exported function, class, or interface lives in its own file. Exception: Zod schemas may be co-located with their interface/type since they are tightly coupled.
- **One class per file** — classes belong in a `models/` folder (e.g., `app/models/`, `shared/models/`).
- **Constants go in `constants.ts`** — all module-level constants in a `constants.ts` file alongside the files that use them.
- **Constant maps use PascalCase** with `as const satisfies` — e.g. `export const DataSourceConfigurationMap = { ... } as const satisfies Partial<Record<...>>`.
- **Generic type maps for polymorphic dispatch** — when a constant map needs to associate a discriminant key (e.g. `DataSourceType`) with a type-parameterised generic (e.g. `DataSourceConfiguration<TItem>`), define an explicit type map first, then use a mapped type in `satisfies` to get per-entry type safety without any `as` casts:
  ```typescript
  // 1. Explicit type map (one file, in models/)
  type DataSourceItemTypeMap = { [DataSourceType.Csv]: CsvDataSourceItem };
  // 2. Satisfies mapped type — each entry is checked against its specific type param
  export const DataSourceConfigurationMap = { ... } as const satisfies Partial<{
    [P in keyof DataSourceItemTypeMap]: DataSourceConfiguration<DataSourceItemTypeMap[P]>;
  }>;
  ```
- **Generic browser utilities** go in `app/utils/` (e.g., `readFileAsText.ts`).
- **Feature folders**: related models/services/components are grouped under a feature subfolder (e.g., `tableEditor/file/`).

### Inline Functions

- **Inline arrow functions** where argument types can be inferred from context — don't extract single-use, trivially-typed lambdas into named functions.
- **`defineModel`**: don't pass `{ default: false }` for booleans — omit the options entirely (`defineModel<boolean>()`).
- **No abbreviated parameter names** — use full descriptive names (e.g. `event` not `e`, `column` not `col`, `configuration` not `config`). Exception: simple iteration callbacks where the meaning is obvious from context (e.g. `.filter((row, index) => ...)`).


### Styling (UnoCSS Attributify Mode — MANDATORY)

- Use prop-based styling: `<div text-red p-4>` for ALL static styles.
- Use `flex` not `d-flex`.
- Use `size` attribute (or `width`/`height` props) instead of `w-<n>` / `h-<n>` where possible.
- Only use `class="..."` when technically required (dynamic `:class` bindings, external component limits).

### Line Endings

- All files must use **LF** line endings (`\n`), not CRLF.
- After creating files on Windows, run `sed -i 's/\r$//' <file>` to strip CR.

### Pinia Store Usage

- **Naming**: use the full store name — `const fileTableEditorStore = useFileTableEditorStore()`, not `const store = ...` or abbreviated names.
- **In Vue components**: always destructure, and keep each store's lines grouped together in this order — no mixing across stores:
  1. `const xyzStore = useXyzStore()`
  2. `const { ref1, ref2 } = storeToRefs(xyzStore)` *(omit if no refs/computeds needed)*
  3. `const { method1 } = xyzStore` *(omit if no methods needed)*
  4. *(repeat for next store)*
- Never use dot-access (`store.method()`) in components.
- **Store-to-store** (inside a Pinia store file): declare nested stores at the root of the setup function, access via `store.property` / `store.method()` — do NOT destructure (Pinia requires dot-access for store-to-store to maintain reactivity).

### Vue Hooks

- Always put a blank line before `watch`, `onMounted`, `onUnmounted`, and other Vue lifecycle hooks/watchers to visually separate them from regular `const` assignments.

### Props Interface Naming

- Always use `interface {ComponentName}Props` (e.g. `interface DialogProps`, `interface EditDialogButtonProps`)
- Always call `defineProps<{ComponentName}Props>()`

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

### CRUD Store Patterns

Follow `createOperationData` conventions exactly when writing store update/delete methods:

- **update**: `findIndex` first, guard `if (index === -1) return`, then mutate in place with `Object.assign(takeOne(items.value, index), updatedItem)`.
- **delete**: reassign the array — `items.value = items.value.filter(...)` — never `splice`.
- Always guard against a missing parent ref before any operation: `if (!parentRef.value) return`.
