---
title: Vite+ migration
description: Proposal — make `vp` the repository's toolchain entry point and cached task runner, retire the hand-rolled build cache and virrun, and leave Nuxt owning the app build.
---

# Vite+ Migration

[Vite+](https://viteplus.dev) is the Vite team's unified toolchain: one `vp` entry point over Vite, Vitest, Oxlint, Oxfmt, Rolldown, tsdown and a cached task runner, MIT-licensed like the projects underneath it ([announcement](https://voidzero.dev/posts/announcing-vite-plus), [beta](https://voidzero.dev/posts/announcing-vite-plus-beta)).

This repository already runs Vitest, Oxlint, Oxfmt and tsdown, and the app's bundler is already Rolldown's Vite. So the distance to Vite+ is not a toolchain distance — every tool it bundles is either installed here or is the thing installed here. The distance is an **entry point** distance, and three commands currently claim that position: `pnpm` orchestrates the workspace, `virrun` wraps anything that must run isolated, and `nuxt` owns the app's build and module graph.

The earlier reading of this was that the entry-point conflict had no answer and the toolchain should not move until it did. That reading was made before the beta, and one fact has since changed the arithmetic: `vp run --cache` **infers its own inputs** by observing what a command reads — file reads, missing-file probes, directory listings, written outputs ([cache guide](https://viteplus.dev/guide/cache)). This repository's caching does the opposite. It hashes every tracked file under a root and then subtracts by hand, which is a policy `get-build-cache-keys` states outright:

> Everything under a hashed root is an input until proven otherwise, and only three things are subtracted

Each of those three subtractions is a heuristic that was discovered by paying a wrong rebuild, and each is a place the key can drift from reality in the direction that serves a stale `dist`. A traced input set deletes the whole category: a file no build opened is provably not an input, and there is no list to maintain.

## The decision

**Adopt `vp` as the outer command for everything except the app build, and let the cache it brings retire both of the content-hash caches this repo maintains.** The migration is not a toolchain swap — the tools stay. It is a consolidation of three entry points into one, and a deletion pass over the machinery that existed only because no entry point owned caching.

The scope is deliberately not "all of Vite+", because Vite+ does not support a Nuxt application in the sense the name suggests — it supports a Vite one, and the app here is not that. Only its framework-agnostic half applies, `vp migrate` cannot be used at all, and the full support matrix with the adoption ladder that follows from it is in [Nuxt compatibility](/docs/proposals/refactors/vite-plus/nuxt-compatibility). Three consequences are worth stating up front:

- **The app build stays Nuxt's.** `nuxt build` is not `vite build` with extra steps, and this is a seam rather than a pending item.
- **ESLint stays for Vue templates.** Oxlint parses a `.vue` file's script and not its template ([Nuxt discussion](https://github.com/nuxt/nuxt/discussions/34857)), which is most of this repo's component surface.
- **virrun's local speed has no replacement.** Its task cache is subsumed and its prepare layer turns out to be a cost it imposes on itself, so what removal actually trades away is the warm-snapshot loop and nothing else. See [virrun retirement](/docs/proposals/refactors/vite-plus/virrun-retirement).

## Where the entry point lands

```mermaid
flowchart TD
  dev["A developer or a CI job"] --> vp["vp — runtime, package manager, tasks, cache"]
  vp --> cached{"Inputs traced on a previous run and unchanged?"}
  cached -->|yes| replay["Replay recorded outputs — nothing executes"]
  cached -->|no| pm["pnpm — workspace graph, catalog, topological order"]
  pm --> app{"Is the task the web app's build?"}
  app -->|yes| nuxt["nuxt build — owns the module graph and prepare output"]
  app -->|no| tools["tsdown · vitest · oxlint · oxfmt"]
  nuxt --> record["Record the traced inputs and outputs against the task"]
  tools --> record
  record --> replay
```

The gate is the whole proposal. Today that diamond does not exist in CI: the decision is made ahead of the run by a `git ls-tree` hash that cannot see what a command will actually open, and made again, differently, by virrun's own task cache. Moving the gate behind the command is what lets both of those disappear.

`vp` does not replace `pnpm` — it drives it. The workspace, the catalog and the topological build order stay exactly where they are declared, which is why the [two product roots](/docs/architecture/monorepo-tooling) and every filter that addresses them survive the migration unedited: `vp run -r --parallel --filter ./packages/*` is the command this repo already writes with a different first word ([monorepo guide](https://viteplus.dev/guide/monorepo)).

## What the migration is made of

| Page                                                                         | Decides                                                                         |
| :--------------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| [Nuxt compatibility](/docs/proposals/refactors/vite-plus/nuxt-compatibility) | what Vite+ supports here, why `vp migrate` is unusable, and the adoption ladder |
| [Phases](/docs/proposals/refactors/vite-plus/phases)                         | each phase's blocker, exit condition and kill condition, plus the parked items  |
| [Task runner](/docs/proposals/refactors/vite-plus/task-runner)               | `vp run --cache` replacing the two content-hash caches, and the CI job shape    |
| [Configuration](/docs/proposals/refactors/vite-plus/configuration)           | the modular config layout, the lint and format blocks, the Nuxt config seam     |
| [virrun retirement](/docs/proposals/refactors/vite-plus/virrun-retirement)   | virrun's three separable jobs, and why none of them blocks removal              |
| [Commands](/docs/proposals/refactors/vite-plus/commands)                     | every root script before and after, and which ones stop existing                |
| [Docs cleanup](/docs/proposals/refactors/vite-plus/docs-cleanup)             | the pages this supersedes, and the tombstones to invert rather than delete      |

The plan is a ladder rather than a swap, and the first rung carries all of the measurable value: tasks that invoke the existing scripts verbatim, with nothing rewritten and Nuxt untouched. It starts with a measurement that can cancel everything below it. [Phases](/docs/proposals/refactors/vite-plus/phases) is the schedule.

## What this is expected to delete

Stated as an expectation rather than a count, because the point of the phase order is that each phase's deletion is only earned once the phase before it has landed:

- One of the two content-hash caches outright, and the composite action that computes the other's key.
- The subtract-list heuristics in that key — the test-source, bench-artifact and markdown exclusions each stop being expressible, because nothing enumerates inputs any more.
- The `virrun --` prefix from every root script, and — once the speed trade is accepted — a published workspace package, its differential correctness harness, its bench artifacts and its docs area.
- The script families whose variants only encode a filter or a fix flag — lint's four spellings, test's three, typecheck's two — since a task runner takes those as arguments. The runtime-pinning script shrinks rather than going, because `vp env` owns the runtime and not this repo's second manifest pin.

## What it does not buy

Two things worth stating before anyone plans around them:

- **No remote cache.** It is on the roadmap and not in the beta, so CI still wraps a local cache directory in `actions/cache` ([CI guide](https://viteplus.dev/guide/ci)). The plumbing stays ours; only the key improves.
- **No early cutoff.** Nothing documented hashes a task's _output_ to stop an invalidation wave when a rebuild produces identical bytes. That remains the one genuinely unowned idea here, and it is the one that would help most on a commit touching a leaf everything depends on — so it is recorded as its own item in [task runner](/docs/proposals/refactors/vite-plus/task-runner) rather than assumed away.
