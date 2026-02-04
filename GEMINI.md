# GEMINI.md

## Repository Overview

**Project**: Esposter
**Description**: A comprehensive social platform monorepo ("A nice and casual place for posting random things").
**Architecture**: Monorepo using pnpm workspaces and Lerna for package management.
**Language**: TypeScript (Strict Mode)
**Runtime**: Node.js `^24.13.0`
**Package Manager**: pnpm `^10.28.1` (with Catalog protocol)

## Technology Stack

### Core

- **Framework**: Nuxt 4 (Beta/RC)
- **UI Library**: Vue 3.5+
- **Build System**: Vite, Rolldown

### Styling

- **Engine**: UnoCSS (Attributify Mode)
- **Components**: Vuetify 3 (Material Design), Custom Components
- **Preprocessors**: Sass (Always use `lang="scss"` in Vue components)

### State & Data

- **State Management**: Pinia
- **API**: tRPC (Client & Server), Nuxt Server Routes
- **Database**:
  - **ORM**: Drizzle ORM
  - **Relational**: PostgreSQL
  - **NoSQL**: Azure Table Storage, Azure Blob Storage

### Infrastructure & Backend

- **Server**: Azure Functions (Serverless), Node.js
- **Cloud Provider**: Microsoft Azure (Event Grid, Web PubSub, Search, Storage)

### Testing & Quality

- **Unit/Integration**: Vitest
- **Linting**: Oxlint (Performance), ESLint (Rules)
- **Documentation**: TypeDoc

## Monorepo Structure

| Package Path               | Package Name                | Description                                                                                            |
| :------------------------- | :-------------------------- | :----------------------------------------------------------------------------------------------------- |
| `packages/app`             | `@esposter/app`             | Main Nuxt 4 web application. Contains frontend UI, server routes overlay, and tRPC client integration. |
| `packages/azure-functions` | `@esposter/azure-functions` | Serverless backend functions triggered by Azure events (Event Grid, Timers, HTTP).                     |
| `packages/db-schema`       | `@esposter/db-schema`       | **Source of Truth** for Database. Contains Drizzle ORM schemas, relations, and migration scripts.      |
| `packages/db`              | `@esposter/db`              | Database connection logic and client initialization.                                                   |
| `packages/shared`          | `@esposter/shared`          | Shared TypeScript types, utility functions, and constants used across the monorepo.                    |
| `packages/configuration`   | `@esposter/configuration`   | Shared configuration files (TSConfig, ESLint, Prettier) to ensure consistency.                         |
| `packages/vue-phaserjs`    | `@esposter/vue-phaserjs`    | Integration layer for Phaser game engine components within Vue.                                        |
| `packages/parse-tmx`       | `@esposter/parse-tmx`       | Utility for parsing Tiled Map Editor (TMX) files.                                                      |
| `packages/azure-mock`      | `@esposter/azure-mock`      | Mock implementations of Azure services for local development and testing.                              |

## Key Concepts & Workflows

### Database Management

Database schemas are defined in `packages/db-schema/src/schema`.
**Commands** (Run from `packages/db-schema`):

- `pnpm db:gen`: Generate SQL migration files from schema changes.
- `pnpm db:up`: Apply pending migrations to the database.
- `pnpm db:studio`: Launch Drizzle Studio to visualize and edit database content.

_Note: Migrations are output to `../app/server/db/migrations`._

### Development Workflow

- **Start Dev Server**: `pnpm dev` (in root) or `pnpm start` (starts `@esposter/app`).
- **Build All**: `pnpm build` (Builds packages -> Docs -> App).
- **Barrel Files**: Uses `ctix` to automatically generate `index.ts` exports.
  - Run `pnpm export:gen` in specific packages to regenerate exports.
- **Lerna**: Used for orchestrating scripts across packages.
  - Example: `lerna run test --scope=@esposter/shared`

### Environment Configuration

The application relies on environment variables defined in `packages/app/configuration/runtimeConfig.ts`.
**Critical Variables**:

- `DATABASE_URL`: Connection string for PostgreSQL.
- `AUTH_SECRET`: Secret for authentication signing.
- `AZURE_STORAGE_ACCOUNT_CONNECTION_STRING`: Access to Azure Storage.
- `AZURE_SEARCH_API_KEY`: Authentication for Azure Search.
- `AZURE_FUNCTION_KEY`: Security key for invoking Azure Functions.

## Coding Conventions

### Styling (UnoCSS)

- **Attributify Mode**: ENABLED & MANDATORY.
  - **Rule**: Use prop-based styling (e.g., `<div text-red p-4>`) for ALL static styles.
  - **Rule**: Use `flex` instead of `d-flex`.
  - **Rule**: Use the `size` attribute (or `width`/`height` props) instead of `w-<number>` or `h-<number>` utility classes where possible.
  - **Exception**: Only use `class="..."` when technically impossible (e.g., dynamic bindings `:class`, some external component limitations).
- **Configuration**: `packages/app/configuration/unocss.ts`

### TypeScript & Linting

- **Strictness**: High (`strictTypeChecked`).
- **Rules**:
  - `Omit` is **BANNED**. Use `Except` (from `type-fest`) instead.
  - `import/no-unassigned-import`: Strict (allows `.css`, `.d.ts`).
  - **Assertions**: Non-null assertions (`!`) are **BANNED**. Use optional chaining or guard clauses.
  - **Loops**: Use `for...of` syntax. `.forEach()` is **BANNED**.
  - **Control Flow**: Prioritize guard clauses (e.g., `if (!condition) return`) over nested `if` statements.
  - Many "unsafe" rules are relaxed for DX.
- **Linter**: `oxlint` runs first for speed, followed by `eslint`.
- **Imports**: Always use named imports from libraries where possible.
- **Types**: Explicitly define variables with proper types. `any` is **BANNED**.

### Component Architecture

- **Nuxt Config**: Modularized in `packages/app/configuration/`.
  - `app.ts`: Head config, PWA manifest.
  - `runtimeConfig.ts`: Environment variables.
  - `unocss.ts`, `vuetify.ts`, `vite.ts`: Tool-specific configs.

### Formatting

- **Variable Assignments**: Group variable assignments together without blank lines between them.
- **Vue Templates**: Avoid unnecessary blank lines within templates.
- **Self-Closing Tags**: Always use self-closing tags (void tags) for components/elements without content (e.g., `<Component />`).
- **Comments**: Remove comments from the code. Make variable names descriptive instead.
- **Whitespace**: Minimize blank lines. Group related code tightly.

### Resource Management

- **Explicit Cleanup**: Always use `onUnmounted` to clean up resources such as:
  - `setInterval` / `setTimeout` IDs.
  - `window.requestAnimationFrame` IDs.
  - Three.js objects (geometries, materials, renderers, controls).
  - Global event listeners.
- **GPU Resource Disposal**:
  - **Traversal**: Use `scene.traverse()` to dispose of all `Mesh` geometries and materials.
  - **Looping**: Use `for (const { dispose } of object.material) dispose()` for material arrays.
  - **Renderers & Controls**: Ensure `renderer.dispose()` and `controls.dispose()` are called.
  - **Guards**: Use `if (!(object instanceof Mesh)) return;` patterns inside traversals.
- **Simplicity**: Prefer explicit `onMounted`/`onUnmounted` pairs over complex composable abstractions for simple resource management to maintain readability and avoid hidden behavior.
- **Composables**: Prioritize using `VueUse` or existing composables (e.g., `useWindowSize`, `useEventListener`) over manual event listeners/logic when possible, unless it conflicts with simplicity or explicit cleanup requirements.
