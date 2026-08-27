# Agent Guide

The canonical guidance for AI coding agents working in this repository. `CLAUDE.md` and `GEMINI.md` are symlinks to it.

This file is an **index and a process**, never a reference. Anything explaining _how_ a subsystem works belongs to the page or skill that owns it — a recipe restated in two places drifts, and this is the file that goes stale first.

## The repository

**Esposter** — a social platform monorepo ("a nice and casual place for posting random things"), TypeScript in strict mode across a pnpm workspace. Nuxt + Vue on the front, tRPC and Nitro server routes behind it, Drizzle over PostgreSQL alongside Azure Table and Blob Storage, Azure Functions for async work, Pinia for state, UnoCSS attributify + Vuetify for styling, Vitest for tests, oxlint + ESLint for lint, Pulumi for infrastructure. Versions live in the manifests; node in `engines.node`, pnpm in `packageManager`.

| Package Path               | npm name                    | Description                                                                |
| :------------------------- | :-------------------------- | :------------------------------------------------------------------------- |
| `packages/app`             | `@esposter/app`             | Main Nuxt web application (frontend, server routes, tRPC)                  |
| `packages/azure`           | `@esposter/azure`           | Azure wire conventions shared by the real clients and the mocks            |
| `packages/azure-functions` | `@esposter/azure-functions` | Serverless backend (EventGrid, Service Bus, Timers)                        |
| `packages/azure-mock`      | `azure-mock`                | Mock Azure service classes for local dev and testing                       |
| `packages/configuration`   | `@esposter/configuration`   | Shared ESLint, TSConfig, and tsdown build configs                          |
| `packages/db`              | `@esposter/db`              | DB connection utilities (Drizzle ORM, Azure Table, Blob, WebPubSub)        |
| `packages/db-mock`         | `@esposter/db-mock`         | In-memory PGlite database factory for unit/integration tests               |
| `packages/db-schema`       | `@esposter/db-schema`       | **Source of truth** for DB: Drizzle ORM schemas, migrations                |
| `packages/infra`           | `@esposter/infra`           | Pulumi infrastructure code and migration tools for Azure                   |
| `packages/parse-tmx`       | `parse-tmx`                 | Parser for Tiled Map Editor `.tmx` files                                   |
| `packages/shared`          | `@esposter/shared`          | Shared TypeScript types, utilities, and error classes                      |
| `packages/shared-node`     | `@esposter/shared-node`     | Benchmark reporting/running for vitest bench (no barrel entrypoint)        |
| `packages/virrun`          | `virrun`                    | Ephemeral in-memory virtual runner — runs a repo's real toolchain isolated |
| `packages/vue-phaserjs`    | `vue-phaserjs`              | Phaser game engine integration for Vue                                     |
| `packages/xml2js`          | `@esposter/xml2js`          | TypeScript rewrite of xml2js — XML ↔ JSON conversion                       |

## Commands

From `packages/app/` unless noted. Always `pnpm`, never `npx`/`npm`.

```bash
pnpm dev                                # start dev server
pnpm typecheck                          # vue-tsc
pnpm lint:fix                           # eslint --fix — the local lint check
pnpm test path/to/file.test.ts --run    # a named suite; never a bare full run locally
pnpm coverage                           # from the repo root, across all workspace projects
```

From the repo root: `pnpm i` after a manifest change, `pnpm update:node [version]` to bump node everywhere, `pnpm depcruise:graph` for `dependency-graph.svg`. In the package where exports changed: `pnpm export:gen` regenerates the ctix barrel. Migrations are generated from `packages/db-schema/` and applied at app startup, never from the CLI — the `drizzle` skill owns all of it.

On Windows, Vitest runs only because `packages/app/configuration/modules.ts` keeps a minimal Nuxt module allowlist under `process.env.VITEST` — loading the full set crashes the run with `spawn EPERM` while UnoCSS reads its config. A test needing an excluded module adds it to the Vitest branch there.

## Finishing a change

Working is not finished. Once the change does what it should — a feature, a fix, a refactor, a docs pass, anything — run this before saying it is done:

1. **`/code-review` over what you changed.** Both lanes, unprompted, every time: quality (reuse, simplification, efficiency, altitude) and correctness (defects, broken conventions). A first draft of anything non-trivial leaves duplicated copy, a constant restated in two files, a twin of an existing helper, or a special case that belonged in the shared mechanism — that gets found here, not by a reviewer. The `code-review` skill owns the lanes, which rules a window loads, the trigger rule a finding must carry, and the stop rule.
2. **Ground the result in tests — only where a test earns its line.** This step deletes at least as often as it adds. Add the regression test for what the review exposed; add nothing another enforcer already owns (typecheck, a Zod constraint, an existing test), because such a test cannot fail honestly and only pins today's implementation; and trim the tests the change made redundant. The full criterion is the `testing` skill's "What to Test".
3. **Carry the docs and skills with it.** A shipped decision updates its owning docs page and, if it is a reusable convention, its owning skill (`docs`, `skill-authoring`) — in the same change, never "later". A rename owes the same sweep over prose: grep the old name across `content/docs`, `.agents/skills`, `.agents/ledgers` and the READMEs, and fix the flow diagrams that label an edge with it. No test fails on a name that only lives in a sentence.
4. **`pnpm format` → `typecheck` → `lint:fix` → tests**, batched once at the end (`context-efficiency`, `package-scripts`). Tests means the paths the change touched, passed as arguments.
5. **Commit** the coherent chunk. Never push unless asked — but once asked, step 4 does not stand in the way: a review slot costs an hour and the checks cost minutes, so the push goes out and the checks run against the same tree beside it (`coderabbit`). Anything they turn up is a commit in the next window.

Skip step 1 only for a genuinely one-line change. When a step finds nothing, say so — that is a result.

Carrying one settled convention across code that predates this ritual is a **sweep**: one file per sweep in `.agents/ledgers/`, tracked as repo state rather than as a proposal, and run per the `sweeps` skill. A sweep is not only a job someone schedules — **when the change edits a file inside a unit an open ledger still lists as unswept, sweep those files first, in their own commit ahead of the behaviour change**, so the ledger drains as a by-product of ordinary work. Scope it to the files being touched, keep the two commits apart, and leave the row alone: coverage tracks whole units, and there is no partially-swept state.

## Where everything is owned

| Subject                                                                      | Owner                                                           |
| :--------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| Storage split, Azure service map, Functions, Event Grid, Service Bus, PubSub | `packages/app/content/docs/architecture/azure-services.md`      |
| Real-time — EventEmitter subscriptions vs Web PubSub fan-out                 | `packages/app/content/docs/architecture/azure-services.md`      |
| Notifications — the one event, Function and delivery path                    | `packages/app/content/docs/architecture/notifications.md`       |
| RBAC — permission bitfield, hierarchy, the service functions                 | `packages/app/content/docs/esbabbler/rbac.md`                   |
| Moderation — `AdminActionType` and the five places it touches                | `packages/app/content/docs/esbabbler/moderation.md`             |
| Message types — `MessageComponentMap` and the shared shells                  | `packages/app/content/docs/esbabbler/message-list-rendering.md` |
| Client reads and writes — `useQuery` / `useMutation` and their exceptions    | `packages/app/content/docs/architecture/client-data.md`         |
| Monorepo orchestration, publishing, installs, CI runners                     | `packages/app/content/docs/architecture/monorepo-tooling.md`    |
| Agent tree — `.agents/`, the `.claude` alias, tool excludes                  | `packages/app/content/docs/architecture/agent-configuration.md` |
| tRPC — router structure, procedure builders, naming, tests                   | `trpc` skill                                                    |
| Schema and migrations — `db:gen`, SQL fixups, chain recovery                 | `drizzle` skill                                                 |
| Slash commands — the registry and adding one                                 | `slash-commands` skill                                          |
| Reviewing anything — lanes, scope, findings, the stop rule                   | `code-review` skill                                             |

Everything else is a skill: read the skill listing and load the ones the files at hand hit. The `code-review` skill's routing table is the same map, keyed by file glob.

## Agent configuration

Configuration read by the installed engineering skills (`triage`, `to-tickets`, `to-spec`, `wayfinder`, `grill-with-docs`, `improve-codebase-architecture`) lives in `.agents/` with the rest of the agent tree. There is no root `docs/` folder — `packages/app/content/docs` is the public docs site. Those skills default to reading `docs/agents/*.md` and one offers to re-run setup when it does not find it: **don't** — that writes a second copy and creates the root `docs/` folder this layout exists to avoid. The deviation in full is in `packages/app/content/docs/architecture/agent-configuration.md`.

- **Issue tracker** — GitHub Issues on `Esposter/Esposter`, via the `gh` CLI; PRs are not a request surface (`.agents/issue-tracker.md`).
- **Triage labels** — five canonical roles, each label string equal to its name (`.agents/triage-labels.md`).
- **Domain docs** — already written; `packages/app/content/docs` is the glossary and the ADR set, so no root `CONTEXT.md` or `docs/adr/` is created (`.agents/domain.md`).
