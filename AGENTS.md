# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Repository Overview

**Project**: Esposter
**Description**: A comprehensive social platform monorepo ("A nice and casual place for posting random things").
**Architecture**: Monorepo using pnpm workspaces. See `architecture/monorepo-tooling.md` for workspace orchestration, publishing, installs, and CI runner policy.
**Language**: TypeScript (Strict Mode)
**Runtime**: Node.js (see `engines.node` in `package.json`)
**Package Manager**: pnpm (see `packageManager` in `package.json`)

## Technology Stack

- **Framework**: Nuxt 4
- **UI Library**: Vue 3.5+
- **Build System**: Vite, Rolldown
- **Styling**: UnoCSS (Attributify Mode), Vuetify 4, Sass
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

## Commands

All commands run from `packages/app/` unless noted.

```bash
pnpm dev              # start dev server
pnpm typecheck        # vue-tsc type check
pnpm lint             # oxlint + eslint (CI/check-only; avoid locally unless requested)
pnpm lint:fix         # oxlint + eslint --fix (use this for local lint verification)
pnpm test             # vitest watch mode
pnpm test path/to/file.test.ts          # run single test file
pnpm test -t "test description"         # run single test by name
pnpm coverage         # vitest run --coverage
```

Do not run Vitest on Windows in this repository unless explicitly requested. Known Windows startup failures include Vite/Rolldown `spawn EPERM` during config loading and UnoCSS/happy-dom path issues; write tests when useful and let the user run them in a supported environment.

When linting locally, run `pnpm lint:fix` directly. `pnpm lint` is mainly for CI/CD check-only verification.

DB migrations (run from `packages/db-schema/`):

```bash
pnpm db:gen           # generate migration from schema changes
pnpm db:up            # apply pending migrations
pnpm db:studio        # Drizzle Studio UI
```

Barrel files (run in the package where you added/removed exports):

```bash
pnpm export:gen       # regenerate index.ts barrel via ctix
```

Dependency installs and graph generation (run from repo root):

```bash
pnpm i                # refresh dependencies/lockfile after package.json changes
pnpm depcruise:graph  # generate dependency-graph.svg from package entrypoints
```

Use plain `pnpm i` for dependency installs. See `architecture/monorepo-tooling.md` for install safety rules.

`pnpm depcruise:graph` should pipe dependency-cruiser DOT output directly into `graphviz-cli` to produce `dependency-graph.svg`. Avoid committing intermediate DOT/Mermaid files unless explicitly needed for debugging.

## Architecture

### Data Storage Split

Two storage systems, each with a distinct role:

- **PostgreSQL (Drizzle ORM)** — relational, structured data: users, rooms, roles, bans, invites, push subscriptions, posts, achievements. Schema lives in `packages/db-schema/src/schema/`. Migrations output to `packages/app/server/db/migrations/`.
- **Azure Table Storage** — high-volume, append-heavy data: messages (`AzureTable.Messages` + `AzureTable.MessagesAscending`), moderation logs (`AzureTable.ModerationLog`). Accessed via `useTableClient` composable in server code. `partitionKey = roomId`, `rowKey = reverseTickedTimestamp` (newest-first ordering).

When adding a new feature, use Postgres for anything relational/queryable and Azure Table for anything message-like (high write volume, time-ordered, no complex joins needed).

### Schema → Migration Workflow

1. Edit schema file in `packages/db-schema/src/schema/` (use `pgTable` wrapper, not raw drizzle `pgTable`)
2. Run `pnpm db:gen` from `packages/db-schema/` to generate the migration SQL
3. Run `pnpm db:up` to apply it
4. If adding new exported types/functions, run `pnpm export:gen` in `packages/db-schema/`

### tRPC Router Organization

Root merger: `packages/app/server/trpc/routers/index.ts`

All feature routers are flat-merged at the root (`message`, `room`, `moderation`, `call`, `directMessage`, etc. — all top-level keys, even logically nested ones). The only exception is `achievement`, which is merged separately to avoid a circular dependency with the router that fires achievement events.

To add a new router:

1. Create `server/trpc/routers/myFeature.ts` exporting `myFeatureRouter`
2. Import and register it in `server/trpc/routers/index.ts`

### tRPC Procedure Helpers

Three RBAC-aware procedure builders in `server/trpc/procedure/room/`:

- `getMemberProcedure` — verifies the caller is a member of the room; use for standard message/room operations
- `getPermissionsProcedure(permission, schema, roomIdKey)` — verifies the caller has a specific `RoomPermission`; use for moderation/admin actions
- `getOwnerProcedure` — verifies the caller owns the room; use for destructive room operations

`getPermissionsProcedure` is the most common for moderation features — it accepts a `RoomPermission` enum value and a Zod input schema, and handles the RBAC check as middleware.

### RBAC System

Permissions stored as a bigint bitfield on `roomRoles` (Postgres). Key service functions in `server/services/room/rbac/`:

- `hasPermission(db, userId, roomId, permission)` — single permission check; room owners and Administrators bypass all checks
- `isManageable(actorTopPosition, targetTopPosition)` — hierarchy check; prevents lower-role members from acting on higher-role members
- `getTopRolePosition(db, userId, roomId)` — returns the actor's highest role position

`RoomPermission` enum and `roomRoles` schema live in `packages/db-schema`.

### Real-time Architecture

Two parallel real-time systems:

- **NodeJS EventEmitter** (`messageEventEmitter`, `moderationEventEmitter`, `roomEventEmitter`) — drives tRPC subscriptions (`onCreateMessage`, `onAdminAction`, etc.); server-side only, in-process
- **Azure WebPubSub** — handles webhook message delivery and cross-process fan-out; accessed via `useWebPubSubServiceClient` composable

When a message is created: `createMessage` → Azure Table write → `messageEventEmitter.emit` → tRPC subscription delivers to connected clients → `getPushSubscriptionsForMessage` → EventGrid → `ProcessPushNotification` Azure Function → web-push to offline users.

### Slash Command Registry

To add a new slash command:

1. Add the new value to `SlashCommandType` enum (`app/models/message/slashCommands/SlashCommandType.ts`)
2. Add the definition to `SlashCommandDefinitionMap` (`app/services/message/slashCommands/SlashCommandDefinitionMap.ts`) — object with `icon`, `title`, `description`, `parameters[]`, `type`
3. Add execution logic to `useExecuteSlashCommand` composable (`app/composables/message/slashCommand/useExecuteSlashCommand.ts`)

### AdminActionType / Moderation

`AdminActionType` enum lives in `packages/db-schema/src/models/message/AdminActionType.ts`. Adding a new action type requires:

1. Add enum value to `AdminActionType`
2. Add arm to the discriminated union in `ExecuteAdminActionInput` (`app/shared/models/db/moderation/ExecuteAdminActionInput.ts`)
3. Add permission mapping in `AdminActionPermissionMap` (`server/services/message/moderation/AdminActionPermissionMap.ts`)
4. Add client-side handler in `useAdminActionMap` (`app/composables/message/moderation/useAdminActionMap.ts`)
5. Add icon/color/label maps in `app/services/message/moderation/`

### MessageType Enum

`MessageType` lives in `packages/db-schema/src/models/message/MessageType.ts`. Adding a new type also requires updating `MessageEntityMap` (maps type → entity class) and `MessageComponentMap` in the app (maps type → Vue component for rendering).

### Azure Functions

Triggered by EventGrid events, not called directly from the app. Located in `packages/azure-functions/src/functions/`. The app publishes events via `EventGrid`; Azure Functions consume them for async work (push notifications, friend request notifications, webhook delivery). No HTTP triggers are exposed to clients.
