# CLAUDE.md

## Repository Overview

**Project**: Esposter
**Description**: A comprehensive social platform monorepo ("A nice and casual place for posting random things").
**Architecture**: Monorepo using pnpm workspaces and Lerna for package management.
**Language**: TypeScript (Strict Mode)
**Runtime**: Node.js `^24.13.0`
**Package Manager**: pnpm `^10.28.1` (with Catalog protocol)

## Technology Stack

- **Framework**: Nuxt 4
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

| Package Path               | Description                                                 |
| :------------------------- | :---------------------------------------------------------- |
| `packages/app`             | Main Nuxt 4 web application (frontend, server routes, tRPC) |
| `packages/azure-functions` | Serverless backend (Azure Event Grid, Timers, HTTP)         |
| `packages/db-schema`       | Source of truth for DB: Drizzle ORM schemas, migrations     |
| `packages/db`              | Database connection logic                                   |
| `packages/shared`          | Shared TypeScript types, utilities, constants               |
| `packages/configuration`   | Shared config (TSConfig, ESLint, Prettier)                  |
| `packages/vue-phaserjs`    | Phaser game engine Vue integration                          |
| `packages/azure-mock`      | Mock Azure services for local dev/testing                   |

## Development Workflow

- **Start Dev Server**: `pnpm dev` (root) or `pnpm start`
- **Build All**: `pnpm build`
- **Barrel Files**: `pnpm export:gen` in specific packages (uses `ctix`)
- **DB Migrations**: `pnpm db:gen` then `pnpm db:up` (from `packages/db-schema`)
- **Type check**: `pnpm typecheck` (in `packages/app/`)
- **Lint**: `pnpm lint` (in `packages/app/`)
- Always use `pnpm` — never `npx`.
