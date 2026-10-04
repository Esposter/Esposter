# Agent Guide

The canonical guidance for AI coding agents working in this repository. `CLAUDE.md` and `GEMINI.md` are symlinks to it.

This file is an **index and a process**, never a reference. Anything explaining _how_ a subsystem works belongs to the page or skill that owns it — a recipe restated in two places drifts, and this is the file that goes stale first.

## The repository

**Esposter** — a social platform monorepo, TypeScript in strict mode across a pnpm workspace. Nuxt + Vue on the front, tRPC and Nitro server routes behind it, Drizzle over PostgreSQL alongside Azure Table and Blob Storage, Azure Functions for async work, Pinia for state, UnoCSS attributify + the app's own UI library on Vuetify 0 for styling, Vitest for tests, oxlint + ESLint for lint, Pulumi for infrastructure. Versions live in the manifests; node in `.node-version`, pnpm in `packageManager`.

| Package Path                    | npm name                  | Description                                                                                                               |
| :------------------------------ | :------------------------ | :------------------------------------------------------------------------------------------------------------------------ |
| `apps/functions`                | `@esposter/functions`     | Serverless backend (EventGrid, Service Bus, Timers)                                                                       |
| `apps/infra`                    | `@esposter/infra`         | Pulumi infrastructure code and migration tools for Azure                                                                  |
| `apps/web`                      | `@esposter/web`           | Main Nuxt web application (frontend, server routes, tRPC)                                                                 |
| `packages/agent-console-server` | `agent-console-server`    | Agent console host — Claude Code sessions through the Agent SDK over a token-gated loopback WebSocket                     |
| `packages/azure`                | `@esposter/azure`         | Azure wire conventions shared by the real clients and the mocks                                                           |
| `packages/azure-mock`           | `azure-mock`              | Mock Azure service classes for local dev and testing                                                                      |
| `packages/configuration`        | `@esposter/configuration` | Shared ESLint, TSConfig, and tsdown build configs                                                                         |
| `packages/db`                   | `@esposter/db`            | DB connection utilities (Drizzle ORM, Azure Table, Blob, WebPubSub)                                                       |
| `packages/db-mock`              | `@esposter/db-mock`       | In-memory PGlite database factory for unit/integration tests                                                              |
| `packages/db-schema`            | `@esposter/db-schema`     | **Source of truth** for DB: Drizzle ORM schemas, migrations                                                               |
| `packages/follow-ups`           | `@esposter/follow-ups`    | Claude Code plugin — a session's unfinished follow-ups written into a TodoList and drained until none is left             |
| `packages/genshin-engine`       | `genshin-engine`          | Anime-style open-world engine for three.js WebGPU — toon materials, outlines, post-processing, world kits and music       |
| `packages/genshin-interface`    | `genshin-interface`       | Genshin's 2D interface — the screen root, its units and pointer, and the pieces the game's screens share                  |
| `packages/genshin-text`         | `genshin-text`            | The game's own words in its fifteen languages — language registry, locale matcher, strings by text id                     |
| `packages/genshin-world`        | `genshin-world`           | Genshin's world on the engine — the region catalogue, each region's data and the TresJS components building it            |
| `packages/genshin-mods`         | `genshin-mods`            | Claude Code plugin — five mods under one band: next steps, cache and handoff, recording mode, goal meter, collision guard |
| `packages/genshin-persona`      | `genshin-persona`         | Claude Code plugin — a Genshin character picked by birthday, replies spoken in its own cloned voice                       |
| `packages/keyframe-store`       | `keyframe-store`          | Content-addressed version store — zstd keyframes and deltas over any backend                                              |
| `packages/parse-tmx`            | `parse-tmx`               | Parser for Tiled Map Editor `.tmx` files                                                                                  |
| `packages/pitch-transcription`  | `pitch-transcription`     | The notes in a recording — Basic Pitch on the current TensorFlow.js, its readings turned into notes, bends and MIDI       |
| `packages/shared`               | `@esposter/shared`        | Shared TypeScript types, utilities, and error classes                                                                     |
| `packages/shared-node`          | `@esposter/shared-node`   | Benchmark reporting/running for vitest bench (no barrel entrypoint)                                                       |
| `packages/trpc-msw`             | `trpc-msw`                | tRPC for Mock Service Worker — HTTP, batching, SSE and WebSockets answered by tRPC's own handlers                         |
| `packages/trpc-nuxt-module`     | `trpc-nuxt-module`        | tRPC for Nuxt — a Nuxt module for the router's HTTP and WebSocket handlers and composables over `useAsyncData`            |
| `packages/virrun`               | `virrun`                  | Ephemeral in-memory virtual runner — runs a repo's real toolchain isolated                                                |
| `packages/vue-phaserjs`         | `vue-phaserjs`            | Phaser game engine integration for Vue                                                                                    |
| `packages/xml2js`               | `@esposter/xml2js`        | TypeScript rewrite of xml2js — XML ↔ JSON conversion                                                                      |
| `scripts`                       | `@esposter/scripts`       | The repo's own tooling: workspace graph, dependency report, sweeps, plugins                                               |

## Commands

From `apps/web/` unless noted. Always `pnpm`, never `npx`/`npm`.

```bash
pnpm dev                                # start dev server
pnpm test path/to/file.test.ts --run    # the suites a change touched; never a bare full run locally
```

**The checks are CI's**, all of them on every push; locally a session runs only the tests of what it touched, and the pre-commit hook formats what is staged (the `running-checks` skill).

From the repo root: `pnpm i` after a manifest change, `pnpm update:node [version]` to bump node everywhere, `pnpm graph:gen` for `dependency-graph.svg`. In a package that gained, renamed or lost a module file: `pnpm build` regenerates its barrel, which is all a sibling typechecking against its source needs. Migrations are generated from `packages/db-schema/` and applied at app startup, never from the CLI — the `drizzle` skill owns all of it.

On Windows, Vitest runs only because `apps/web/configuration/modules.ts` keeps a minimal Nuxt module allowlist under `process.env.VITEST` — loading the full set crashes the config load while `@vite-pwa/nuxt` resolves its virtual register module (the error and the probe that retires the fork are in `apps/web/content/docs/architecture/test-harness-workarounds.md`). A test needing an excluded module adds it to the Vitest branch there.

## Finishing a change

Working is not finished. Once the change does what it should — a feature, a fix, a refactor, a docs pass, anything — run this before saying it is done. Steps 1–3 are an audit with a table of its own, which the `finishing` skill owns and `/finishing` runs at any point in the work, asked or not:

1. **`/code-review` over what you changed.** Both lanes, unprompted, every time: quality (reuse, simplification, efficiency, altitude) and correctness (defects, broken conventions). A first draft of anything non-trivial leaves duplicated copy, a constant restated in two files, a twin of an existing helper, or a special case that belonged in the shared mechanism — that gets found here, not by a reviewer. The `code-review` skill owns the lanes, which rules a window loads, the trigger rule a finding must carry, and the stop rule.
2. **Ground the result in tests — only where a test earns its line.** This step deletes at least as often as it adds. Add the regression test for what the review exposed; add nothing another enforcer already owns (typecheck, a Zod constraint, an existing test), because such a test cannot fail honestly and only pins today's implementation; and trim the tests the change made redundant. The full criterion is the `testing` skill's "What to Test".
3. **Carry the docs and skills with it.** A shipped decision updates its owning docs page and, if it is a reusable convention, its owning skill (the `docs` skill and the `skill-authoring` skill) — in the same change, never "later". A rename owes the same sweep over prose: grep the old name across `content/docs`, `.agents/skills`, `.agents/ledgers` and the READMEs, and fix the flow diagrams that label an edge with it. A behaviour change owes that sweep with no name to grep, so the lookup runs the other way: list the pages whose `Key files` table names a source you changed, and read each one's prose and diagrams against what the code now does. No test fails on a name that only lives in a sentence, and none fails on a sentence that was true last week.
4. **The tests of what the change touched**, once at the end and **in the background** while the session keeps working — the paths the change touched, passed as arguments, plus, where a change moved bytes into a bundle, that package's own suite, since only a fresh build moves its size snapshot. Nothing else runs locally: typecheck, lint and format are CI's on the push (step 6).
5. **Commit the coherent chunk by pathspec, then `pnpm ai:queue:push`.** The collector rewrites `origin/ai/queue` behind every window, so the local branch goes stale the moment one ports; the script replays from the fork point only what the sessions committed since and pushes plain — never a bare `--force-with-lease`. A dirty tree is another session's and never stashed: the script replays in a throwaway detached worktree instead, so only a conflicting replay makes the push wait (the `review-queue` skill). Step 4 does not stand in the way: a queue push starts no review, so the push goes out and the tests run against the same tree beside it. Anything they turn up is a commit behind it.
6. **Watch the push's CI run, and fix its typecheck and lint.** The run is watched in the background like the tests, and a red typecheck or lint job is the session's own, not left for later: read the job's failed log, reproduce it with that one check, fix it, and push a commit behind it, then watch again until both are green. Only a red that reaches `main` is the collector's repair (`apps/web/content/docs/infra/review-collector/repair.md`, and the `running-checks` skill).

Skip step 1 only for a genuinely one-line change. When a step finds nothing, say so — that is a result.

Carrying one settled convention across code that predates this ritual is a **sweep**: one file per sweep in `.agents/ledgers/`, tracked as repo state rather than as a proposal, and run per the `sweeps` skill. A sweep is not only a job someone schedules — **when the change edits a file inside a unit an open ledger still lists as unswept, sweep those files first, in their own commit ahead of the behaviour change**, so the ledger drains as a by-product of ordinary work. Scope it to the files being touched, keep the two commits apart, and leave the row alone: coverage tracks whole units, and there is no partially-swept state.

## Where everything is owned

| Subject                                                                      | Owner                                                       |
| :--------------------------------------------------------------------------- | :---------------------------------------------------------- |
| Storage split, Azure service map, Functions, Event Grid, Service Bus, PubSub | `apps/web/content/docs/architecture/azure-services.md`      |
| Real-time — EventEmitter subscriptions vs Web PubSub fan-out                 | `apps/web/content/docs/architecture/azure-services.md`      |
| Notifications — the one event, Function and delivery path                    | `apps/web/content/docs/architecture/notifications.md`       |
| RBAC — permission bitfield, hierarchy, the service functions                 | `apps/web/content/docs/esbabbler/rbac.md`                   |
| Moderation — `AdminActionType` and every place it touches                    | `apps/web/content/docs/esbabbler/moderation.md`             |
| Message types — `MessageComponentMap` and the shared shells                  | `apps/web/content/docs/esbabbler/message-list-rendering.md` |
| Client reads and writes — `useQuery` / `useMutation` and their exceptions    | `apps/web/content/docs/architecture/client-data.md`         |
| Monorepo orchestration, publishing, installs, CI runners                     | `apps/web/content/docs/architecture/monorepo-tooling.md`    |
| Agent tree — `.agents/`, the `.claude` alias, tool excludes                  | `apps/web/content/docs/architecture/agent-configuration.md` |
| Engineering loops — where work enters, what feeds what, what runs next       | `apps/web/content/docs/architecture/engineering-loops.md`   |
| Game text — the game's own words in its languages, by text id                | `genshin-text` skill                                        |
| Building a proposal — choosing, verifying, shipping, handing back            | `building-proposals` skill                                  |
| tRPC — router structure, procedure builders, naming, tests                   | `trpc` skill                                                |
| Schema and migrations — `db:gen`, SQL fixups, chain recovery                 | `drizzle` skill                                             |
| Slash commands — the registry and adding one                                 | `slash-commands` skill                                      |
| Reviewing anything — lanes, scope, findings, the stop rule                   | `code-review` skill                                         |
| Enforcing a rule — construction, primitive, lint, test, then prose           | `apps/web/content/docs/architecture/enforcement-ladder.md`  |

Everything else is a skill: read the skill listing and load the ones the files at hand hit. The `code-review` skill's routing table is the same map, keyed by file glob.

## Agent configuration

Configuration read by the installed engineering skills (the Matt Pocock set the docs page lists) lives in `.agents/` with the rest of the agent tree. There is no root `docs/` folder — `apps/web/content/docs` is the public docs site. Those skills default to reading `docs/agents/*.md` and one offers to re-run setup when it does not find it: **don't** — that writes a second copy and creates the root `docs/` folder this layout exists to avoid. The deviation in full is in `apps/web/content/docs/architecture/agent-configuration.md`.

- **Issue tracker** — GitHub Issues on `Esposter/Esposter`, via the `gh` CLI; PRs are not a request surface (`.agents/issue-tracker.md`).
- **Triage labels** — five canonical roles, each label string equal to its name (`.agents/triage-labels.md`).
- **Domain docs** — already written; `apps/web/content/docs` is the glossary and the ADR set, so no root context file or ADR folder is created (`.agents/domain.md`).
