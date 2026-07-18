# Agent Guide

This file is the canonical guidance for AI coding agents working in this repository. `CLAUDE.md` and `GEMINI.md` are symlinks to it.

## Repository Overview

**Project**: Esposter
**Description**: A comprehensive social platform monorepo ("A nice and casual place for posting random things").
**Architecture**: Monorepo using pnpm workspaces. See `packages/app/content/docs/architecture/monorepo-tooling.md` for workspace orchestration, publishing, installs, and CI runner policy.
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
- **Cloud**: Microsoft Azure (Event Grid, Web PubSub, Search, Storage), LiveKit
- **Testing**: Vitest
- **Linting**: Oxlint + ESLint

## Monorepo Structure

| Package Path               | npm name                    | Description                                                                |
| :------------------------- | :-------------------------- | :------------------------------------------------------------------------- |
| `packages/app`             | `@esposter/app`             | Main Nuxt 4 web application (frontend, server routes, tRPC)                |
| `packages/azure-functions` | `@esposter/azure-functions` | Serverless backend (EventGrid, Timers) — push notifications, webhooks      |
| `packages/azure-mock`      | `azure-mock`                | Mock Azure service classes for local dev and testing                       |
| `packages/configuration`   | `@esposter/configuration`   | Shared ESLint, TSConfig, and Rolldown build configs                        |
| `packages/db`              | `@esposter/db`              | DB connection utilities (Drizzle ORM, Azure Table, Blob, WebPubSub)        |
| `packages/db-mock`         | `@esposter/db-mock`         | In-memory PGlite database factory for unit/integration tests               |
| `packages/db-schema`       | `@esposter/db-schema`       | **Source of truth** for DB: Drizzle ORM schemas, migrations                |
| `packages/infra`           | `@esposter/infra`           | Pulumi infrastructure code and migration tools for Azure                   |
| `packages/parse-tmx`       | `parse-tmx`                 | Parser for Tiled Map Editor `.tmx` files                                   |
| `packages/shared`          | `@esposter/shared`          | Shared TypeScript types, utilities, and error classes                      |
| `packages/shared-node`     | `@esposter/shared-node`     | Node-only shared tooling (benchmark reporting, dev scripts)                |
| `packages/virrun`          | `virrun`                    | Ephemeral in-memory virtual runner — runs a repo's real toolchain isolated |
| `packages/vue-phaserjs`    | `vue-phaserjs`              | Phaser 4 game engine integration for Vue 3                                 |
| `packages/xml2js`          | `@esposter/xml2js`          | TypeScript rewrite of xml2js — XML ↔ JSON conversion                       |

## Commands

All commands run from `packages/app/` unless noted.

```bash
pnpm dev              # start dev server
pnpm typecheck        # vue-tsc type check
pnpm lint             # eslint (CI/check-only; avoid locally unless requested). Oxlint runs once from repo root, not per-package.
pnpm lint:fix         # eslint --fix (use this for local lint verification)
pnpm test             # vitest watch mode
pnpm test path/to/file.test.ts          # run single test file
pnpm test -t "test description"         # run single test by name
pnpm coverage         # run from repo root — vitest --coverage across all workspace projects
```

Vitest runs on Windows. The former `spawn EPERM` / UnoCSS config-load crash was fixed by giving `packages/app/configuration/modules.ts` a minimal Nuxt module allowlist under `process.env.VITEST` (no UnoCSS/PWA/security/SEO). If a new test needs an excluded module, add it to the Vitest branch there.

DB migrations (run from `packages/db-schema/`). All wrap `drizzle-kit` via `db:run`:

```bash
pnpm db:gen           # drizzle-kit generate — writes a migration folder to packages/app/server/db/migrations/
pnpm db:up            # drizzle-kit up — upgrades snapshot metadata to a newer drizzle-kit format. NOT an apply command.
pnpm db:studio        # Drizzle Studio UI
```

Nothing here applies migrations. They are applied **automatically at app startup** by the Nitro plugin `packages/app/server/plugins/migrate.ts`, which calls drizzle-orm's `migrate(db, { migrationsFolder: "server/db/migrations" })`.

Barrel files (run in the package where you added/removed exports):

```bash
pnpm export:gen       # regenerate index.ts barrel via ctix
```

Dependency installs and graph generation (run from repo root):

```bash
pnpm i                # refresh dependencies/lockfile after package.json changes
pnpm update:node      # bump engines.node + @types/node, install/switch via fnm, remove old version
pnpm depcruise:graph  # generate dependency-graph.svg from package entrypoints
```

Use plain `pnpm i` for dependency installs. See `packages/app/content/docs/architecture/monorepo-tooling.md` for install safety rules. `pnpm update:node [version]` bumps the node version everywhere in one call (see the `dependency-updates` skill).

`pnpm depcruise:graph` pipes dependency-cruiser DOT output directly into `graphviz-cli` to produce `dependency-graph.svg`. Avoid committing intermediate DOT/Mermaid files unless explicitly needed for debugging.

## Architecture

### Data Storage Split

Two storage systems, each with a distinct role:

- **PostgreSQL (Drizzle ORM)** — relational, structured data: users, rooms, roles, bans, invites, push subscriptions, posts, achievements. Schema lives in `packages/db-schema/src/schema/`. Migrations output to `packages/app/server/db/migrations/`.
- **Azure Table Storage** — high-volume, append-heavy data: messages (`AzureTable.Messages` + `AzureTable.MessagesAscending`), moderation logs (`AzureTable.ModerationLog`). Accessed via `useTableClient` composable in server code. `partitionKey = roomId`, `rowKey = reverseTickedTimestamp` (newest-first ordering).

When adding a new feature, use Postgres for anything relational/queryable and Azure Table for anything message-like (high write volume, time-ordered, no complex joins needed).

### Schema → Migration Workflow

1. Edit schema file in `packages/db-schema/src/schema/` (use `pgTable` wrapper, not raw drizzle `pgTable`)
2. Generate the migration with `pnpm db:gen` from `packages/db-schema/` — this is the **only** sanctioned way to produce `snapshot.json`. Inject the URL from the app env (`export DATABASE_URL="$(grep '^DATABASE_URL=' ../app/.env | cut -d= -f2-)"`); `db:gen` only reads it for config validation — the diff is schema-vs-snapshot and never touches the DB. Then rename the random codename folder descriptively (`20260714000000_file_to_sheet_rename`), keeping the timestamp prefix.
3. If adding new exported types/functions, run `pnpm export:gen` in `packages/db-schema/`
4. Migrations apply on next app startup (see the migrate plugin above) — there is no apply script to run

**Never hand-clone `snapshot.json`.** Copying a previous snapshot and bumping `id`/`prevIds` by hand forks the migration chain the instant two migrations descend from the same parent, and the next `db:gen` fails with `Non-commutative migrations detected`. `snapshot.json` is machine state — always let `db:gen` produce it. Don't run `db:gen` as an unprompted side effect of a schema edit; note the pending migration and let the user decide when to run it (see the `drizzle` skill).

**Fixing up the generated `migration.sql` by hand is allowed and expected — but only the SQL, and only before it's applied.** The migrator's bookkeeping hash is `sha256(migration.sql)`, computed at apply time, so an un-applied `migration.sql` is free to edit; `snapshot.json` stays exactly as generated. Where drizzle-kit's diff is destructive, rewrite the SQL to preserve data — e.g. replace a generated drop/recreate with `ALTER TYPE "public"."resource_type" RENAME VALUE 'File' TO 'Sheet';`. Report to the user that a migration is pending; it applies when they next start the app.

### tRPC Router Organization

Root merger: `packages/app/server/trpc/routers/index.ts`

Most feature routers are registered as top-level keys (`message`, `room`, `role`, `resource`, `callSession`, etc.). Logically nested routers are nested for real, not flattened — e.g. `moderationRouter` is merged into `messageRouter` and reached as `message.moderation` (`$trpc.message.moderation.deleteBan`), alongside `message.emoji` and `message.scheduledMessageJob`. Check the parent router before assuming a key is top-level.

`achievement` is the one merge-time exception: it's merged onto `trpcRouterWithoutAchievements` via `mergeRouters` to avoid a circular dependency with the routers that fire achievement events.

To add a new router:

1. Create `server/trpc/routers/myFeature.ts` exporting `myFeatureRouter`
2. Import and register it in `server/trpc/routers/index.ts`

See `.claude/skills/trpc/SKILL.md` for full conventions (structure, naming, test patterns, procedure helpers).

### tRPC Procedure Helpers

Three RBAC-aware procedure builders in `server/trpc/procedure/room/`:

- `getMemberProcedure` — verifies the caller is a member of the room; use for standard message/room operations
- `getPermissionsProcedure(permission, schema, roomIdKey)` — verifies the caller has a specific `RoomPermission`; use for moderation/admin actions
- `getOwnerProcedure` — verifies the caller owns the room; use for destructive room operations

`getPermissionsProcedure` is the most common for moderation features — it accepts a `RoomPermission` enum value and a Zod input schema, and handles the RBAC check as middleware.

### RBAC System

Permissions stored as a bigint bitfield on `roomRoles` (Postgres). Key service functions:

- `hasPermission(db, userId, roomId, permission)` — single permission check; room owners and Administrators bypass all checks. Lives in `@esposter/db` (`packages/db/src/services/room/rbac/`); `server/services/room/rbac/hasPermission.ts` is a re-export. Same for `getPermissions`.
- `checkIsManageable(actorTopPosition, targetPosition, isRoomOwner)` — hierarchy check; prevents lower-role members from acting on higher-role members. Room owners always pass. Lives in `packages/app/shared/services/room/rbac/checkIsManageable.ts` (shared — used by both `server/trpc/routers/` and the client `role` store).
- `getTopRolePosition(db, userId, roomId)` — the actor's highest role position, `-1` if none. Overloaded: pass a `roomId[]` to get a `Map<string, number>` instead. In `server/services/room/rbac/`.
- `getActorContext(db, actorUserId, roomId)` — bundles `{ actorTopPosition, isOwner }`, the usual input to `checkIsManageable`. In `server/services/room/rbac/`.

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

Background handlers triggered by EventGrid events or Service Bus queues, not called directly from the app. Located in `packages/azure-functions/src/functions/`. The app publishes events via `EventGrid` for fire-and-forget async work (push notifications, friend request notifications, webhook delivery) and enqueues Service Bus messages for delayed/scheduled work (scheduled message jobs, which need `scheduleMessages` delivery at a future `runAt`). No HTTP triggers are exposed to clients.
