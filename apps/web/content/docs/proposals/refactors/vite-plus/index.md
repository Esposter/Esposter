---
title: Vite+ migration
description: Proposal — with CI's builds already cached under `vp run`, what remains — `vp env` as the runtime manager, the local loop's cache after virrun retires, and the built-in commands — while every tool stays on the catalog's version and Nuxt keeps owning the app build.
model: claude-opus-5-5
---

# Vite+ Migration

[Vite+](https://viteplus.dev) is the Vite team's unified toolchain: one `vp` entry point over Vite, Vitest, Oxlint, Oxfmt, Rolldown, tsdown, a runtime and package-manager manager, and a cached task runner, MIT-licensed like the projects underneath it ([1.0 announcement](https://voidzero.dev/posts/announcing-vite-plus-1-0)). It is stable since 1.0, and stable has a precise meaning there: semver covers the `vp` CLI and the config schema — command names, flags, config keys and generated file locations hold for the whole 1.x line — and explicitly does **not** cover the bundled tools, which keep their own version numbers ([Q3 plan](https://github.com/voidzero-dev/vite-plus/issues/2405)).

This repository already runs Vitest, Oxlint, Oxfmt and tsdown, and the app's bundler is already Rolldown's Vite. So the distance to Vite+ is not a toolchain distance. It is an **entry point** distance, and three commands currently claim that position: `pnpm` orchestrates the workspace, `virrun` wraps anything that must run isolated, and `nuxt` owns the app's build and module graph.

What made the move worth weighing at all is the cache. `vp run` **infers its own inputs** by observing what a command reads — file reads, missing-file probes, directory listings, written outputs ([cache guide](https://viteplus.dev/guide/cache)) — where the key it replaced hashed every tracked file under a root and subtracted by hand. That premise was measured before it gated anything, and it held: both CI builds now run under it, and the hand-kept key is gone ([monorepo tooling](/docs/architecture/monorepo-tooling), `## CI job shape`). What this page still decides is everything beyond CI's builds.

## The decision

**Adopt `vp` for the two jobs it does that nothing here does well — a traced task cache and runtime provisioning — and nothing else.** Every tool keeps running from the binary the workspace catalog installs, invoked by the existing scripts. The migration is a consolidation of entry points and a deletion pass over the caching machinery, not a toolchain swap.

The narrower scope than "all of Vite+" has two independent causes:

- **The app is a Nuxt app, not a Vite one.** Vite+'s `dev`, `build` and `migrate` are built for a project that calls Vite directly; the full support matrix is in [Nuxt compatibility](/docs/proposals/refactors/vite-plus/nuxt-compatibility). The app build stays `nuxt build`, reached as a task — a seam, not a pending item.
- **The built-in tool commands are a separate decision.** The `vite-plus` package pins exact versions of the tools it bundles, each behind the catalog; root overrides point every one of them at the catalog, so the lockfile holds one copy of each and Renovate keeps owning them ([configuration](/docs/proposals/refactors/vite-plus/configuration)). That makes `vp lint` and `vp fmt` usable, but moving the scripts onto them changes who reads the settings and nothing they do, so it waits on its own reason.

## Recommendation

Each rung of the [adoption ladder](/docs/proposals/refactors/vite-plus/nuxt-compatibility) gets a verdict on its own, because the value and the risk sit on different rungs.

| Rung                                           | Verdict                                     | Why                                                                                                                                                                                                                                      |
| :--------------------------------------------- | :------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime and package manager (`vp env`)         | **Available now, optional**                 | independent of the cache; deletes the fnm and Corepack workarounds in the local install scripts, while CI already provisions both through one action and gains nothing                                                                   |
| Task caching in CI                             | **Shipped**                                 | both builds under `vp run`, the hand-kept key deleted ([monorepo tooling](/docs/architecture/monorepo-tooling))                                                                                                                          |
| Task caching in the local loop                 | **Wait for virrun**                         | a cached task cannot spawn children under bubblewrap, and a Windows tracer cannot see into WSL, so local caching only exists for commands that run natively ([virrun retirement](/docs/proposals/refactors/vite-plus/virrun-retirement)) |
| `vp lint`, `vp fmt`, `vp check`, `vp test`     | **Not yet**                                 | the overrides run the catalog's tools, so version ownership no longer blocks them; `vp check`'s type-check cannot read `.vue` files and `vp test` has two blockers of its own                                                            |
| `vp dev`, `vp build`, `vp migrate` for the app | **Never, while Nuxt owns the module graph** | the app is not a Vite application                                                                                                                                                                                                        |

So the short answer now: CI's builds are cached; take `vp env` if the local install scripts are worth deleting; the local loop's cache waits on virrun; everything else waits on its own trigger.

## Where the entry point lands

```mermaid
flowchart TD
  dev["A developer or a CI job"] --> vp["vp — runtime, package manager, tasks, cache"]
  vp --> cached{"Inputs traced on a previous run and unchanged?"}
  cached -->|yes| replay["Replay recorded outputs — nothing executes"]
  cached -->|no| pm["pnpm — workspace graph, catalog, topological order"]
  pm --> app{"Is the task the web app's build?"}
  app -->|yes| nuxt["nuxt build — owns the module graph and prepare output"]
  app -->|no| tools["the catalog's own tsdown · vitest · oxlint · oxfmt"]
  nuxt --> record["Record the traced inputs and outputs against the task"]
  tools --> record
  record --> replay
```

The gate is the whole proposal. Today that diamond does not exist in CI: the decision is made ahead of the run by a `git ls-tree` hash that cannot see what a command will actually open, and made again, differently, by virrun's own task cache. Moving the gate behind the command is what lets both of those disappear.

`vp` does not replace `pnpm` — it drives it. The workspace, the catalog and the topological build order stay exactly where they are declared, which is why the [two product roots](/docs/architecture/monorepo-tooling) and every filter that addresses them survive the migration unedited: `vp run -r --filter "./packages/*" build` is the command this repo already writes with a different first word ([run guide](https://viteplus.dev/guide/run)).

## What the migration is made of

| Page                                                                         | Decides                                                                                    |
| :--------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| [Nuxt compatibility](/docs/proposals/refactors/vite-plus/nuxt-compatibility) | what Vite+ supports here, why `vp migrate` is unusable, and the adoption ladder            |
| [Phases](/docs/proposals/refactors/vite-plus/phases)                         | each phase's blocker, exit condition and kill condition, the upstream issues they read     |
| [Configuration](/docs/proposals/refactors/vite-plus/configuration)           | the one root config `vp` needs, why lint and format stay in their own files, the Nuxt seam |
| [virrun retirement](/docs/proposals/refactors/vite-plus/virrun-retirement)   | virrun's three separable jobs, and why the local cache waits on removing it                |
| [Commands](/docs/proposals/refactors/vite-plus/commands)                     | every root script before and after, and which ones stop existing                           |
| [Docs cleanup](/docs/proposals/refactors/vite-plus/docs-cleanup)             | the pages this supersedes, and the tombstones to invert rather than delete                 |

## What this is expected to delete

CI's two content-hash caches and their subtract-list are already gone. The rest, stated as an expectation rather than a count, because each phase's deletion is only earned once the phase before it has landed:

- The fnm and Corepack provisioning in `update:node`'s install scripts, if `vp env` is taken; the pin-writing half stays.
- The `virrun --` prefix from every root script, and — once the speed trade is accepted — a published workspace package, its differential correctness harness, its bench artifacts and its docs area.

## What it does not buy

- **No remote cache in 1.0.** `vite-task` has since merged one — an endpoint named by `cache: { remote: { url } }` or `VP_REMOTE_CACHE_URL`, read by default, written with `--remote-cache=read-write`, uploads authenticated by a GitHub Actions OIDC token ([changelog](https://github.com/voidzero-dev/vite-task/blob/main/CHANGELOG.md)) — but the `vite-task` revision `vite-plus` 1.0.0 pins predates it, and upstream ships no server — its server API is still a [draft design](https://github.com/voidzero-dev/vite-task/pull/713), not a merged contract — so the endpoint would be ours to host, against a specification that may still change. Until a release carries the client, CI wraps a local cache directory in `actions/cache` ([CI guide](https://viteplus.dev/guide/ci)), and the plumbing stays ours; only the key improves.
- **No shorter script surface by itself.** The lint, test and typecheck script families encode arguments, but pnpm forwards arguments too, so collapsing them is not something `vp` unlocks ([commands](/docs/proposals/refactors/vite-plus/commands)).

## Sources

- [Announcing Vite+ 1.0](https://voidzero.dev/posts/announcing-vite-plus-1-0) — what 1.0 bundles, and remote caching listed as future work.
- [vite-task changelog](https://github.com/voidzero-dev/vite-task/blob/main/CHANGELOG.md) and [remote cache server API draft](https://github.com/voidzero-dev/vite-task/pull/713) — the remote cache client merged after 1.0's pin, and the still-unmerged proposal for the contract a self-hosted endpoint would implement.
- [Vite+ Q3 plan](https://github.com/voidzero-dev/vite-plus/issues/2405) — what the 1.0 semver promise covers, and that bundled tools keep their own versions.
- [Vite+ cache guide](https://viteplus.dev/guide/cache) and [run guide](https://viteplus.dev/guide/run) — inputs inferred from what a command reads, and the pnpm-compatible filters.
