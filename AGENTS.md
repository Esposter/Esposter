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
| `packages/shared-node`     | `@esposter/shared-node`     | Benchmark reporting/running for vitest bench (no barrel entrypoint)        |
| `packages/virrun`          | `virrun`                    | Ephemeral in-memory virtual runner — runs a repo's real toolchain isolated |
| `packages/vue-phaserjs`    | `vue-phaserjs`              | Phaser 4 game engine integration for Vue 3                                 |
| `packages/xml2js`          | `@esposter/xml2js`          | TypeScript rewrite of xml2js — XML ↔ JSON conversion                       |

## Commands

All commands run from `packages/app/` unless noted.

```bash
pnpm dev              # start dev server
pnpm typecheck        # vue-tsc type check
pnpm lint             # eslint check-only for the app (CI parity). Oxlint is not part of this command — it runs only via the root-level pnpm lint.
pnpm lint:fix         # eslint --fix (use this for local lint verification)
pnpm test             # vitest watch mode
pnpm test path/to/file.test.ts          # run single test file
pnpm test -t "test description"         # run single test by name
pnpm coverage         # run from repo root — vitest --coverage across all workspace projects
```

On Windows, Vitest runs only because `packages/app/configuration/modules.ts` keeps a minimal Nuxt module allowlist under `process.env.VITEST` (no UnoCSS/PWA/security/SEO) — loading the full set crashes the run there with `spawn EPERM` while UnoCSS reads its config. If a new test needs an excluded module, add it to the Vitest branch there.

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
pnpm update:node      # bump engines.node + @types/node, install + fnm default, remove old version
pnpm depcruise:graph  # generate dependency-graph.svg from package entrypoints
```

Use plain `pnpm i` for dependency installs. See `packages/app/content/docs/architecture/monorepo-tooling.md` for install safety rules. `pnpm update:node [version]` bumps the node version everywhere in one call (see the `dependency-updates` skill).

`pnpm depcruise:graph` pipes dependency-cruiser DOT output directly into `graphviz-cli` to produce `dependency-graph.svg`. Avoid committing intermediate DOT/Mermaid files unless explicitly needed for debugging.

## Finishing a change

Working is not finished. Once the change does what it should — a feature, a fix, a refactor, a docs pass, anything — run this before saying it is done:

1. **`/simplify`** — the cleanup pass: reuse (`file-organization`), simplification (`typescript`, `vue-composable-patterns`), efficiency (`pinia`, `pagination`), altitude (the area's own skill). A first draft of anything non-trivial leaves duplicated copy, a constant restated in two files, a twin of an existing helper, or a special case that belonged in the shared mechanism. That gets found and fixed here, not in review. **Every literal the change introduced is checked against what already exists** — an enum member, a separator, a registry entry, a configuration-map value — and replaced by the import wherever one already means it (`file-organization`).
2. **Ground the result in tests — only where a test earns its line.** This step deletes at least as often as it adds. A test is worth writing when it fails on a change someone would care about and nothing cheaper already catches that; the full criterion, and the list of tests to delete on sight, is the `testing` skill's "What to Test".
   - **Add the regression test for what the pass exposed** — a bug found, an invariant that was only ever true by accident, a shared helper that now has more callers than the one it was written for.
   - **Add nothing another enforcer already owns.** No test for what typecheck proves (a mechanical schema rewrite, a rename, a tightened type), for a Zod constraint, or for behaviour an existing test already covers. Such a test cannot fail honestly — it only pins the current implementation and breaks on the next real refactor.
   - **Trim and dedupe the tests themselves.** Repeated fixtures become one `create*` helper; twin test files become a behaviour matrix plus a thin wiring test. Tests bloat exactly like code does, and removing one a change made redundant is part of that change.
3. **Carry the docs and skills with it.** A shipped decision updates its owning docs page and, if it is a reusable convention, its owning skill (`docs`, `skill-authoring`) — in the same change, never "later". A change that renames or moves anything owes the same sweep over prose: grep the old name across `content/docs`, `.agents/skills`, `.agents/ledgers` and the READMEs, and fix the flow diagrams that label an edge with it. No test fails on a name that only lives in a sentence.
4. **`pnpm format` → `typecheck` → `lint:fix` → tests**, batched once at the end (`context-efficiency`, `package-scripts`). Tests means **the paths the change touched**, passed as arguments — a bare `pnpm test --run` over the whole suite is banned locally and belongs to CI, which shards it.
5. **Commit** the coherent chunk. Never push unless asked.

Skip step 1 only for a genuinely one-line change. When a step finds nothing, say so — that is a result.

Carrying one settled convention across code that predates this ritual is a **sweep**: one file per sweep in `.agents/ledgers/`, tracked as repo state rather than as a proposal, and run per the `sweeps` skill.

A sweep is not only a job someone schedules. **When the change edits a file inside a unit an open ledger still lists as unswept, sweep those files first, in their own commit ahead of the behaviour change** — the ledger drains as a by-product of ordinary work instead of waiting for a sitting. Scope it to the files being touched, keep the two commits apart, and leave the row alone: the coverage table tracks whole units, and there is no partially-swept state (`sweeps` skill).

## Architecture

### Data Storage Split

Two storage systems, each with a distinct role:

- **PostgreSQL (Drizzle ORM)** — relational, structured data: users, rooms, roles, bans, invites, push subscriptions, posts, achievements. Schema lives in `packages/db-schema/src/schema/`. Migrations output to `packages/app/server/db/migrations/`.
- **Azure Table Storage** — high-volume, append-heavy data: messages (`AzureTable.Messages` + `AzureTable.MessagesAscending`), moderation logs (`AzureTable.ModerationLog`). Accessed via `useTableClient` composable in server code. `partitionKey = roomId`, `rowKey = reverseTickedTimestamp` (newest-first ordering).

When adding a new feature, use Postgres for anything relational/queryable and Azure Table for anything message-like (high write volume, time-ordered, no complex joins needed).

### Schema → Migration Workflow

Edit the schema in `packages/db-schema/src/schema/` (the `pgTable` wrapper, not raw drizzle), register every
export — tables **and** `pgEnum`s — in `packages/db-schema/src/schema.ts`, and the migration is generated by
`pnpm db:gen` from that package once the user asks for it. Nothing applies migrations from the CLI; they run at
app startup via `server/plugins/migrate.ts`.

`db:gen` is the only sanctioned way to produce `snapshot.json`, and it is never an unprompted side effect of a
schema edit — note the pending migration and let the user choose when to run it. Everything else about running
it, hand-editing the generated SQL, and recovering a forked chain is in the `drizzle` skill.

### tRPC Router Organization

Root merger: `packages/app/server/trpc/routers/index.ts`

Most feature routers are registered as top-level keys (`message`, `room`, `role`, `resource`, `callSession`, etc.). Logically nested routers are nested for real, not flattened — e.g. `moderationRouter` is merged into `messageRouter` and reached as `message.moderation` (`$trpc.message.moderation.deleteBan`), alongside `message.emoji` and `message.scheduledMessageJob`. Check the parent router before assuming a key is top-level.

`achievement` is the one merge-time exception: it's merged onto `trpcRouterWithoutAchievements` via `mergeRouters` to avoid a circular dependency with the routers that fire achievement events.

Structure, naming, the RBAC-aware procedure builders and test patterns: the `trpc` skill.

### Real-time Architecture

Two parallel real-time systems:

- **NodeJS EventEmitter** (`messageEventEmitter`, `moderationEventEmitter`, `roomEventEmitter`) — drives tRPC subscriptions (`onCreateMessage`, `onAdminAction`, etc.); server-side only, in-process
- **Azure WebPubSub** — handles webhook message delivery and cross-process fan-out; accessed via `useWebPubSubServiceClient` composable

When a message is created: `createMessage` → Azure Table write → `messageEventEmitter.emit` → tRPC subscription delivers to connected clients → `getPushSubscriptionsForMessage` → EventGrid → `ProcessPushNotification` Azure Function → web-push to offline users.

### Where the feature detail lives

Per-feature registries and the steps for extending them are **not** here — a recipe restated in two places drifts,
and this file is the one that goes stale first. Each of these owns its own subject in full:

| Subject                                                       | Owner                                                           |
| :------------------------------------------------------------ | :-------------------------------------------------------------- |
| RBAC — permission bitfield, hierarchy, the service functions  | `packages/app/content/docs/esbabbler/rbac.md`                   |
| Moderation — `AdminActionType` and the five places it touches | `packages/app/content/docs/esbabbler/moderation.md`             |
| Slash commands — the registry and adding one                  | `slash-commands` skill                                          |
| Message types — `MessageComponentMap` and the shared shells   | `packages/app/content/docs/esbabbler/message-list-rendering.md` |
| tRPC — procedure builders, structure, naming, tests           | `trpc` skill                                                    |
| Migrations — `db:gen`, SQL fixups, chain recovery             | `drizzle` skill                                                 |
| Agent tree — `.agents/`, the `.claude` alias, tool excludes   | `packages/app/content/docs/architecture/agent-configuration.md` |

### Azure Functions

Background handlers, mostly triggered by EventGrid events or Service Bus queues rather than called from the app. Located in `packages/azure-functions/src/functions/`. The app publishes events via `EventGrid` for fire-and-forget async work (push notifications, friend request notifications, webhook delivery) and enqueues Service Bus messages for delayed/scheduled work (scheduled message jobs, which need `scheduleMessages` delivery at a future `runAt`). Two timer triggers run on their own schedules (`PurgeDeletedResources`, `SendTodoReminder`), and one HTTP trigger is routed publicly — `PushWebhook` (`POST webhooks/{id}/{token}`, `authLevel: "function"`), which validates its token from the url. No other HTTP surface exists here, and the app never calls these handlers directly.

## Agent skills

Configuration read by the installed engineering skills (`triage`, `to-tickets`, `to-spec`, `wayfinder`, `grill-with-docs`, `improve-codebase-architecture`). It lives in `.agents/` with the rest of the agent tree — there is no root `docs/` folder, and `packages/app/content/docs` is the public docs site. Those skills default to reading `docs/agents/*.md` and one of them offers to re-run setup when it does not find it: **don't** — that writes a second copy and creates the root `docs/` folder this layout exists to avoid. Which of the two a new file belongs in, and the deviation in full, are settled in `packages/app/content/docs/architecture/agent-configuration.md`.

### Issue tracker

GitHub Issues on `Esposter/Esposter`, via the `gh` CLI; PRs are not treated as a request surface. See `.agents/issue-tracker.md`.

### Triage labels

The five canonical roles, each label string equal to its name (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `.agents/triage-labels.md`.

### Domain docs

Single-context, and **already written** — `packages/app/content/docs` is the glossary and the ADR set, so no root `CONTEXT.md` or `docs/adr/` is created. See `.agents/domain.md`.
