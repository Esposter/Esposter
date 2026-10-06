---
title: Vite+
description: What `vp` owns here — a traced task cache for the builds and the runtime and package-manager install — and what it deliberately does not, with every tool kept on the catalog's version and Nuxt owning the app build.
---

# Vite+

[Vite+](https://viteplus.dev) is the Vite team's toolchain behind one `vp` entry point: a cached task runner, a runtime and package-manager manager, and built-in commands over Vite, Vitest, Oxlint, Oxfmt, Rolldown and tsdown. This repository takes the jobs nothing else here did well — **a task cache keyed on what a command read, the runtime install, and one config every lint and format reader shares** — and leaves the test runner and the app's own commands where they are. Every tool keeps running from the binary the catalog installs.

## The task cache

The builds and the two whole-repository checks run as tasks of the root `vite.config.ts` — `build:packages`, `build:app`, `lint` and `typecheck` — under `vp run`, which traces every file a task and its child processes open, probe or list, and replays the recorded run only when each still matches. How CI carries the cache, why a hit needs the install, and why the app build replays on the packages' built bytes are in [monorepo tooling](/docs/architecture/monorepo-tooling) under `## CI job shape`. Tasks are cached by default, so no `--cache` flag is written; it exists to cache a plain script. The same tasks cache locally, natively on a Windows host: an unchanged `vp run build:packages` replays in seconds where it builds in a minute.

**A cached command is a task, never a script.** A script carries no cache settings, and a task may not share a script's name, so a script that needs caching moves into a task under its own name and the script is deleted — `build:packages`, `lint` and `typecheck` are `vp run <name>`, and the leaves `lint` and `typecheck` aggregate stay scripts. `build:app` is the one task with no script behind it: it wraps the app's own `build`, which stays the deploy entrypoint by name. A task that writes nothing anyone reads keeps no outputs, so its replay restores nothing and is the verdict alone.

**A task's settings are the files its command rewrites.** A build that rewrites a file it also read makes `vp` refuse to cache it, naming the file. Each task's `cache.input` keeps automatic tracking and subtracts exactly those files; they stay outputs, so a replay restores them. pnpm's own install and run state is subtracted from every task, since no build's result depends on it and the dependencies themselves are traced file by file. The list fails safe — a newly rewritten file is a refusal, never a stale replay — and `vp` names only the first, so a newly refused build is listed whole by building once and taking the tracked files newer than its start. A test pinning the list would restate the config, so none exists.

**A directory listing is fingerprinted by every name in it**, and an input exclusion does not reach it ([vite-task 504](https://github.com/voidzero-dev/vite-task/issues/504)). A generated file that a fresh checkout lacks would therefore make every run miss; the package build's `dist` and generated barrels travel with the cache for that reason (`run-cached-task`'s `paths`).

Before the cache gated anything, every probe was run against this tree: a source edit, a content edit, a `.vue` edit, and a file created where a build had looked for one. Each missed, or replayed only when nothing it read had changed. The native tools were probed on Linux as well, because the tracer there interposes on libc for a dynamically linked process and a read that skips libc goes unseen ([vite-task 777](https://github.com/voidzero-dev/vite-task/issues/777)). The Go compiler `typecheck` loads in-process and tsgolint, the statically linked binary behind type-aware lint, both missed on an edit to a file only they read. A new native tool is probed the same way before a task caches it.

## One copy of every tool

`vite-plus` is a root dev dependency, and it depends on exact versions of Oxlint, Oxfmt, the Oxlint plugin API, tsgolint and Vitest with its subpackages, each behind the catalog, and aliases `vite` to its own core build. Root `overrides` point every one of those at `catalog:`, and its `vite` takes the workspace's global `vite` override like every other dependent, so the lockfile resolves one version of each tool and `vp` runs on plain Vite. The catalog stays the one statement of every version and Renovate keeps bumping it. The cost is running the `vp` CLI a minor or two ahead of the tools it was released against; a release that starts depending on its core build's internals fails the cached tasks loudly, and the fix is narrowing the `vite` override to leave `vite-plus` out.

## One config, composed from a module per tool

`vite.config.ts` composes its blocks the way `nuxt.config.ts` composes `apps/web/configuration/`: `lint` is imported from `oxlint.config.ts`, `fmt` from `oxfmt.config.ts`, and only `run` is written in place. The root lint and format scripts run `vp lint` and `vp fmt`, and the bare `oxlint` and `oxfmt` — the pre-commit hook, the editor, the ESLint bridge — read the same two files, so every reader of a setting reads one object. The built-in commands run the catalog's binaries, through the overrides above, so a lint run is the same pass whichever reader started it. The config imports its types from `vite-plus` and configures no bundler — the app builds through `nuxt build` from `apps/web/nuxt.config.ts`. Nuxt discourages a standalone `vite.config.ts`, but its check resolves from the app's own root, and this one sits at the workspace root above it, so the two config trees coexist with nothing warned about.

## The runtime

`vp env` provisions node and pnpm from the two pins the repository already keeps, `.node-version` and `packageManager`, through shims that replace Corepack; `pnpm update:node` writes the pin and hands the install to it. The procedure is the `dependency-updates` skill's (`references/updating-node.md`). CI is untouched: `pnpm/setup` reads the same two pins.

## virrun is an opt-in

The root scripts run their tools natively. virrun stays installed with its `virrun.config.ts`, and `pnpm virrun -- <cmd>` runs one command in its sandbox when a job wants the RAM overlay or the warm snapshot — but nothing routes through it, because `vp run`'s tracer cannot follow a command into the sandbox ([vite-task 700](https://github.com/voidzero-dev/vite-task/issues/700)) and a Windows tracer cannot see into WSL. A routed check could never be cached locally; a native one can.

## What `vp` does not own

- **`vp test` as the runner** — [deferred](/docs/architecture/deferred/vite-plus-test-runner) behind three blockers.
- **`vp dev`, `vp build` and `vp migrate` for the app** — [deferred](/docs/architecture/deferred/vite-plus-app-commands) while Nuxt owns the module graph.
- **A remote cache** — [deferred](/docs/architecture/deferred/vite-plus-remote-cache) until a release carries the client and there is a server to point it at.

## Key files

| File                                          | Role                                                                                        |
| :-------------------------------------------- | :------------------------------------------------------------------------------------------ |
| `vite.config.ts`                              | the `run` block — each cached build and check a task, with the files it rewrites subtracted |
| `pnpm-workspace.yaml`                         | the `vite-plus` catalog entry and the overrides that leave one copy of each tool            |
| `.github/actions/run-cached-task/action.yaml` | restores the task cache, runs the task, saves the cache when it executed                    |
| `scripts/src/updateNode/index.ts`             | writes the node pin and hands the install to `vp env`                                       |
| `virrun.config.ts`                            | the opt-in sandbox's backend per platform                                                   |

## Sources

- [Announcing Vite+ 1.0](https://voidzero.dev/posts/announcing-vite-plus-1-0) and the [Q3 plan](https://github.com/voidzero-dev/vite-plus/issues/2405) — what 1.0 bundles, and that its semver covers the CLI and config schema but not the bundled tools.
- [Vite+ cache guide](https://viteplus.dev/guide/cache), [run config](https://viteplus.dev/config/run) and [CI guide](https://viteplus.dev/guide/ci) — inputs inferred from what a command reads, tasks cached by default, and the CI shape.
- [Vite+ env guide](https://viteplus.dev/guide/env) — `vp env` resolving the node pin and `packageManager` per directory.
- [vite-task 504](https://github.com/voidzero-dev/vite-task/issues/504), [700](https://github.com/voidzero-dev/vite-task/issues/700) and [777](https://github.com/voidzero-dev/vite-task/issues/777) — directory listings and exclusions, the sandbox, and the Linux reads the tracer misses.
