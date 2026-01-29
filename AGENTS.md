# AGENTS.md

## Repository Context

**Project**: Esposter
**Type**: Monorepo (pnpm workspaces + Lerna)
**Language**: TypeScript (Strict)
**Runtime**: Node.js v24+

## Tech Stack

- **Framework**: Nuxt 4 (Beta/RC), Vue 3.5+
- **Styling**: Vuetify 3, UnoCSS, Sass
- **State**: Pinia
- **Database**: Postgres (Drizzle ORM), Azure Table Storage
- **Backend**: Azure Functions (Serverless), tRPC
- **Build**: Vite, Rolldown
- **Testing**: Vitest, oxlint
- **Docs**: TypeDoc

## Architecture

- **Frontend**: `@esposter/app`. Nuxt application. Uses `trpc-nuxt` for API calls. Modular config in `packages/app/configuration/`.
- **Backend**:
  - `@esposter/azure-functions`: Serverless functions (Webhooks, etc.).
- **Database**:
  - `@esposter/db-schema`: Drizzle ORM schemas (`src/schema`, `src/models`). Source of truth.
  - `@esposter/db`: Database connection/client logic.
- **Shared**:
  - `@esposter/shared`: Common utils/types.
  - `@esposter/configuration`: Shared config files (TS, etc.).
- **Specialized**:
  - `@esposter/vue-phaserjs`: Phaser game engine integration.
  - `@esposter/parse-tmx`: Tiled map parsing.

## Key Directories

| Path                       | Purpose                            |
| -------------------------- | ---------------------------------- |
| `packages/app`             | Main Web Application (Nuxt)        |
| `packages/azure-functions` | Azure Functions (Backend triggers) |
| `packages/db-schema`       | Database definitions (Drizzle)     |
| `packages/shared`          | Shared logic/types                 |
| `scripts`                  | Maintainance/Build scripts         |

## Development

- **Package Manager**: `pnpm` (uses Catalog for versions).
- **Build**: `pnpm build` (Builds packages -> Docs -> App).
- **Dev**: `pnpm dev` (Nuxt dev server).
- **Test**: `pnpm test` (Lerna run test).
- **Lint**: `pnpm lint` (oxlint + eslint).
- **Typecheck**: `pnpm typecheck` (tsc + vue-tsc).

## Conventions & Syntax

### Styling (UnoCSS)

- **Mode**: **Attributify** is enabled.
- **Usage**: Use "valueless" attributify props where possible (e.g., `<div text-red p-4>`). Only use value assignment for special cases (e.g. `<div w="1/2">`). Standard classes (`class="..."`) are **NOT** acceptable unless attributify is impossible.
- **Config**: Defined in `packages/app/configuration/unocss.ts`.

### Linting & Code Style

- **Tools**: `oxlint` (First pass, fast), `eslint` (TypeScript/Vue rules).
- **Oxlint**:
  - Categories: `pedantic`, `suspicious`, `style`, `perf` are **Errors**.
  - Exceptions: Pragmatic generic rules (e.g. `no-magic-numbers`) are disabled.
- **TypeScript**:
  - Base: `strictTypeChecked` + `stylisticTypeChecked`.
  - **Critical Rule**: `Omit` is **BANNED**. Use `Except` from `type-fest` (or similar) instead.
  - **Relaxed Rules**: Many "unsafe" TS rules (e.g., `no-unsafe-assignment`, `no-unsafe-call`) are disabled for better DX.
  - **Imports**: `import/no-unassigned-import` is strict (allows `*.css`, `*.d.ts`).

## Important Versions

- **Node**: `^24.13.0`
- **pnpm**: `^10.28.1`
- **Nuxt**: `^4.3.0`
- **Vue**: `^3.5.27`
