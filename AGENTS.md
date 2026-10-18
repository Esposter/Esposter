# Agent Guide

The canonical guidance for AI coding agents working in this repository, the one instruction file: Claude Code loads `AGENTS.md` wherever a project has no `CLAUDE.md`, so there is none.

This file is an **index and a process**, never a reference. Anything explaining _how_ a subsystem works belongs to the page or skill that owns it — a recipe restated in two places drifts, and this is the file that goes stale first.

## The repository

**Esposter** — a social platform monorepo, TypeScript in strict mode across a pnpm workspace. Nuxt + Vue on the front, tRPC and Nitro server routes behind it, Drizzle over PostgreSQL alongside Azure Table and Blob Storage, Azure Functions for async work, Pinia for state, UnoCSS attributify + the app's own UI library on Vuetify 0 for styling, Vitest for tests, oxlint + ESLint for lint, Pulumi for infrastructure. Versions live in the manifests; node in `.node-version`, pnpm in `packageManager`.

| Package Path                        | npm name                   | Description                                                                                                                                                                                                                    |
| :---------------------------------- | :------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/functions`                    | `@esposter/functions`      | Serverless backend (EventGrid, Service Bus, Timers)                                                                                                                                                                            |
| `apps/infra`                        | `@esposter/infra`          | Pulumi infrastructure code and migration tools for Azure                                                                                                                                                                       |
| `apps/web`                          | `@esposter/web`            | Main Nuxt web application (frontend, server routes, tRPC)                                                                                                                                                                      |
| `packages/agent-console-server`     | `agent-console-server`     | Agent console host — Claude Code sessions through the Agent SDK over a token-gated loopback WebSocket                                                                                                                          |
| `packages/azure`                    | `@esposter/azure`          | Azure wire conventions shared by the real clients and the mocks                                                                                                                                                                |
| `packages/azure-mock`               | `azure-mock`               | Mock Azure service classes for local dev and testing                                                                                                                                                                           |
| `packages/configuration`            | `@esposter/configuration`  | Shared ESLint, TSConfig, and tsdown build configs                                                                                                                                                                              |
| `packages/db`                       | `@esposter/db`             | DB connection utilities (Drizzle ORM, Azure Table, Blob, WebPubSub)                                                                                                                                                            |
| `packages/db-mock`                  | `@esposter/db-mock`        | In-memory PGlite database factory for unit/integration tests                                                                                                                                                                   |
| `packages/db-schema`                | `@esposter/db-schema`      | **Source of truth** for DB: Drizzle ORM schemas, migrations                                                                                                                                                                    |
| `packages/follow-ups`               | `@esposter/follow-ups`     | Claude Code plugin — a session's unfinished follow-ups written into a TodoList and drained until none is left                                                                                                                  |
| `packages/genshin-engine`           | `genshin-engine`           | Anime-style open-world engine for three.js WebGPU — toon materials, outlines, post-processing, world kits and music                                                                                                            |
| `packages/genshin-interface`        | `genshin-interface`        | Genshin's 2D interface — the screen root, its units and pointer, and the pieces the game's screens share                                                                                                                       |
| `packages/genshin-mods`             | `genshin-mods`             | Claude Code plugin — six mods under one band: next steps, cache and handoff, recording mode, goal meter, collision guard, delegation guard                                                                                     |
| `packages/genshin-persona`          | `genshin-persona`          | Claude Code plugin — a Genshin character picked by birthday, replies spoken in its own cloned voice                                                                                                                            |
| `packages/genshin-text`             | `genshin-text`             | The game's own words in its fifteen languages — language registry, locale matcher, strings by text id                                                                                                                          |
| `packages/genshin-world`            | `genshin-world`            | Genshin's world on the engine — the region catalogue, each region's data and the TresJS components building it                                                                                                                 |
| `packages/keyframe-store`           | `keyframe-store`           | Content-addressed version store — zstd keyframes and deltas over any backend                                                                                                                                                   |
| `packages/nuxt-security-module`     | `nuxt-security-module`     | Nuxt security module for Nitro 3 and h3 2 — security headers, a nonce Content Security Policy, subresource integrity, CORS, basic auth, a rate limiter and a request size limit                                                |
| `packages/parse-tmx`                | `parse-tmx`                | Parser for Tiled Map Editor `.tmx` files                                                                                                                                                                                       |
| `packages/pitch-transcription`      | `pitch-transcription`      | The notes in a recording — Basic Pitch on ONNX Runtime, its readings turned into notes, bends and MIDI                                                                                                                         |
| `packages/shared`                   | `@esposter/shared`         | Shared TypeScript types, utilities, and error classes                                                                                                                                                                          |
| `packages/shared-node`              | `@esposter/shared-node`    | Node-only shared tooling — the machine-wide download cache (`/cache`), hidden-window child processes (`/child-process`) and benchmark reporting for vitest bench                                                               |
| `packages/tresjs-nuxt`              | `tresjs-nuxt`              | TresJS for Nuxt — a Nuxt module that auto-imports the TresJS core API, registers TresCanvas for client and server, and registers every installed @tresjs package's components and composables, with no devtools UI of its own. |
| `packages/trpc-msw`                 | `trpc-msw`                 | tRPC for Mock Service Worker — HTTP, batching, SSE and WebSockets answered by tRPC's own handlers                                                                                                                              |
| `packages/trpc-nuxt-module`         | `trpc-nuxt-module`         | tRPC for Nuxt — a Nuxt module for the router's HTTP and WebSocket handlers and composables over `useAsyncData`                                                                                                                 |
| `packages/vue-grid-layout-headless` | `vue-grid-layout-headless` | A headless grid: the placement of items on a grid of cells, and the pointer gestures that move and resize them, with no styling.                                                                                               |
| `packages/vue-pdfjs-headless`       | `vue-pdfjs-headless`       | Headless Vue composables over pdfjs-dist: a document's loading, a page's drawing and the viewer's state, with no styling and no renderer of its own.                                                                           |
| `packages/vue-phaserjs`             | `vue-phaserjs`             | Phaser game engine integration for Vue                                                                                                                                                                                         |
| `scripts`                           | `@esposter/scripts`        | The repo's own tooling: workspace graph, dependency report, sweeps, plugins                                                                                                                                                    |

## Commands

From `apps/web/` unless noted. Always `pnpm`, never `npx`/`npm`.

```bash
pnpm dev                                # start dev server
pnpm test path/to/file.test.ts --run    # the suites a change touched; never a bare full run locally
```

**A session starts with `pnpm ai:resume`** from the repo root, and takes up new work only once it reports clean: whatever an earlier session, agent or machine left half-done is finished, recorded or released first (the `resuming` skill).

**The checks are CI's**, all of them on every push; locally a session runs only the tests of what it touched, and the pre-commit hook only formats what is staged (the `running-checks` skill).

From the repo root: `pnpm i` after a manifest change, `pnpm update:node [version]` to bump node everywhere, `pnpm graph:gen` for `dependency-graph.svg`. In a package that gained, renamed or lost a module file: `pnpm build` regenerates its barrel, which is all a sibling typechecking against its source needs. Migrations are generated from `packages/db-schema/` and applied at app startup, never from the CLI — the `drizzle` skill owns all of it.

On Windows, Vitest runs only because `apps/web/configuration/modules.ts` keeps a minimal Nuxt module allowlist under `process.env.VITEST` — loading the full set crashes the config load while `@vite-pwa/nuxt` resolves its virtual register module (the error and the probe that retires the fork are in `openspec/specs/architecture/test-harness-workarounds/design.md`). A test needing an excluded module adds it to the Vitest branch there.

## Finishing a change

Working is not finished. Once the change does what it should — a feature, a fix, a refactor, a spec pass, anything — run this before saying it is done. Steps 1–3 are an audit with a table of its own, which the `finishing` skill owns and `/finishing` runs at any point in the work, asked or not:

1. **`/code-review` over what you changed.** Both lanes, unprompted, every time: quality (reuse, simplification, efficiency, altitude) and correctness (defects, broken conventions). A first draft of anything non-trivial leaves duplicated copy, a constant restated in two files, a twin of an existing helper, or a special case that belonged in the shared mechanism — that gets found here, not by a reviewer. The `code-review` skill owns the lanes, which rules a window loads, the trigger rule a finding must carry, and the stop rule.
2. **Ground the result in tests — only where a test earns its line.** This step deletes at least as often as it adds. Add the regression test for what the review exposed; add nothing another enforcer already owns (typecheck, a Zod constraint, an existing test), because such a test cannot fail honestly and only pins today's implementation; and trim the tests the change made redundant. The full criterion is the `testing` skill's "What to Test".
3. **Carry the specs and skills with it.** A shipped decision updates its owning spec and, if it is a reusable convention, its owning skill (the `openspec` skill and the `skill-authoring` skill) — in the same change, never "later". A rename owes the same sweep over prose: grep the old name across `openspec`, `.agents/skills`, `.agents/ledgers` and the READMEs, and fix the flow diagrams that label an edge with it. A behaviour change owes that sweep with no name to grep, so the lookup runs the other way: list the designs whose `Key files` table names a source you changed, and read each one's prose and diagrams against what the code now does. No test fails on a name that only lives in a sentence, and none fails on a sentence that was true last week.
4. **The tests of what the change touched**, once at the end and **in the background** while the session keeps working — the paths the change touched, passed as arguments, plus, where a change moved bytes into a bundle, that package's own suite, since only a fresh build moves its size snapshot. Nothing else runs locally: typecheck, lint and format are CI's on the push (step 6).
5. **Commit the coherent chunk by pathspec on `ai/queue` itself in the main checkout (a worktree only for a concurrent change), then land it:** `git pull --rebase origin ai/queue && git push origin HEAD:ai/queue`, retried on a rejected push (the `review-queue` skill's loop, its worktree and its conflicts). Nothing rewrites `ai/queue`, so the pull replays only the commits you have not landed yet (the `review-queue` skill). Step 4 does not stand in the way: a push to `ai/queue` starts a review run that gates nothing, so the push goes out and the tests run against the same tree beside it. Anything they turn up is a commit behind it.
6. **Verification waits until asked.** A push's CI run is not watched by the session, and nothing is fixed on its account unless the user asks for verification. Then read the red job's failed log, reproduce it with that one check, fix it, and push a commit behind it (the `running-checks` skill). A red that reaches `main` was red on `ai/queue` first, so it is fixed there, the same way.

Skip step 1 only for a genuinely one-line change. When a step finds nothing, say so — that is a result.

Carrying one settled convention across code that predates this ritual is a **sweep**: one file per sweep in `.agents/ledgers/`, tracked as repo state rather than as a proposal, and run per the `sweeps` skill. A sweep is not only a job someone schedules — **when the change edits a file inside a unit an open ledger still lists as unswept, sweep those files first, in their own commit ahead of the behaviour change**, so the ledger drains as a by-product of ordinary work. Scope it to the files being touched, keep the two commits apart, and leave the row alone: coverage tracks whole units, and there is no partially-swept state.

## Specifications

Every feature is described under `openspec/`, and where its folder lives says whether it is built: `openspec/specs/` for what exists, `openspec/changes/` for what is designed and waiting, `openspec/deferred/` and `openspec/rejected/` for what was decided against for now or for good. A change is archived into the specs in the change that ships it. The `openspec` skill owns the process; `openspec/config.yaml` holds the artifact rules. GitHub renders the tree, diagrams included, so there is no docs site.

## Syncing to main

`main` moves by the review's fast-forward. The one exception is the owner's **sync to main**: the session reviews `main..ai/queue` locally (both lanes, every commit in the window), fixes each finding in its own commit on `ai/queue`, and once the review passes fast-forwards `main` to the tip and its local `main` with it. No other session pushes `main`. The procedure, its limits and the direct-push cases are the `review-queue` skill's.

## Where everything is owned

| Subject                                                                      | Owner                                                       |
| :--------------------------------------------------------------------------- | :---------------------------------------------------------- |
| Storage split, Azure service map, Functions, Event Grid, Service Bus, PubSub | `openspec/specs/architecture/azure-services/design.md`      |
| Real-time — EventEmitter subscriptions vs Web PubSub fan-out                 | `openspec/specs/architecture/azure-services/design.md`      |
| Notifications — the one event, Function and delivery path                    | `openspec/specs/architecture/notifications/design.md`       |
| RBAC — permission bitfield, hierarchy, the service functions                 | `openspec/specs/esbabbler/rbac/design.md`                   |
| Moderation — `AdminActionType` and every place it touches                    | `openspec/specs/esbabbler/moderation/design.md`             |
| Message types — `MessageComponentMap` and the shared shells                  | `openspec/specs/esbabbler/message-list-rendering/design.md` |
| Client reads and writes — `useQuery` / `useMutation` and their exceptions    | `openspec/specs/architecture/client-data/design.md`         |
| Monorepo orchestration, publishing, installs, CI runners                     | `openspec/specs/architecture/monorepo-tooling/design.md`    |
| Agent tree — `.agents/`, the `.claude` alias, tool excludes                  | `openspec/specs/architecture/agent-configuration/design.md` |
| Engineering loops — where work enters, what feeds what, what runs next       | `openspec/specs/architecture/engineering-loops/design.md`   |
| Review: what lands on `ai/queue`, reviewed and fixed by haiku                | `openspec/specs/infra/review/design.md`                     |
| Game text — the game's own words in its languages, by text id                | `genshin-text` skill                                        |
| Building a proposal — choosing, verifying, shipping, handing back            | `building-proposals` skill                                  |
| Specifications and decision records — OpenSpec changes under `openspec/`     | `openspec` skill                                            |
| tRPC — router structure, procedure builders, naming, tests                   | `trpc` skill                                                |
| Schema and migrations — `db:gen`, SQL fixups, chain recovery                 | `drizzle` skill                                             |
| Slash commands — the registry and adding one                                 | `slash-commands` skill                                      |
| Reviewing anything — lanes, scope, findings, the stop rule                   | `code-review` skill                                         |
| Enforcing a rule — construction, primitive, lint, test, then prose           | `openspec/specs/architecture/enforcement-ladder/design.md`  |

Everything else is a skill: read the skill listing and load the ones the files at hand hit. The `code-review` skill's routing table is the same map, keyed by file glob.

## Agent configuration

Configuration read by the installed engineering skills (the Matt Pocock set the agent-configuration design lists) lives in `.agents/` with the rest of the agent tree. There is no root `docs/` folder — the specs live in `openspec/`. Those skills default to reading `docs/agents/*.md` and one offers to re-run setup when it does not find it: **don't** — that writes a second copy and creates the root `docs/` folder this layout exists to avoid. The deviation in full is in `openspec/specs/architecture/agent-configuration/design.md`.

- **Issue tracker** — GitHub Issues on `Esposter/Esposter`, via the `gh` CLI; PRs are not a request surface (`.agents/issue-tracker.md`).
- **Triage labels** — five canonical roles, each label string equal to its name (`.agents/triage-labels.md`).
- **Domain docs** — already written; `openspec/` is the glossary and the decision record, so no root context file or ADR folder is created (`.agents/domain.md`).
