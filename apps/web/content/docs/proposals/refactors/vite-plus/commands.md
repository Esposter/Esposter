---
title: Commands
description: Every root script under the migration — which become cached `vp` tasks, which `vp` subsumes, which stay, and why collapsing the script families is not part of it.
model: claude-opus-5-5
---

# Commands

The migration changes how scripts are invoked far more than which scripts exist. Under the [decision](/docs/proposals/refactors/vite-plus) every tool keeps running from the catalog's own binary, so a script's body stays what it is today; what changes is that the build and check scripts run under `vp run --cache`, and that the `virrun --` prefix goes once [virrun retirement](/docs/proposals/refactors/vite-plus/virrun-retirement) lands.

## Cached as tasks

The build scripts already run as cached tasks in CI — `build:packages` and `build:app`, tasks of the root `vite.config.ts` — `build:packages` folded in from the script it replaced, `build:app` wrapping the app's own `build` ([monorepo tooling](/docs/architecture/monorepo-tooling)). The checks can follow in CI under the same probes, and locally only after virrun is gone, since a cached task cannot run inside its sandbox ([phases](/docs/proposals/refactors/vite-plus/phases)).

Two scripts must never become cache-gated by accident, and both are about the dependency graph rather than the cache:

- **`format:check` declares no dependency on any build task.** It is the quickest job in CI precisely because a formatter reading source files waits for nothing, and a task runner's default is to respect the graph.
- **`release` stays a chain of checks, never fixes.** Every step in it is a non-writing check, for the reason [monorepo tooling](/docs/architecture/monorepo-tooling) records under `pnpm release`, so a release fails on a dirty tree rather than tidying it. Its ordering also survives: the format check is the only step that can run cold, because everything after it reads what the build writes.

## What `vp` subsumes

One script, and only half of it: `update:node`. Its install half went to `vp env`, which manages Node and the package manager together through shims that stand in for Corepack. Its writer half stays — the node pin and the matching type-definitions catalog entry, written together, whose only other writer is Renovate's `node` group ([monorepo tooling](/docs/architecture/monorepo-tooling)) — because `vp env` reads the pin and writes neither.

Four more `vp` commands look like replacements and are not taken:

- **`format` and `format:check`, against `vp fmt`.** It runs the Oxfmt that `vite-plus` pins, not the catalog's ([configuration](/docs/proposals/refactors/vite-plus/configuration)).
- **The checks, against `vp check`.** Its formatting and linting are the pinned copies again, and its type-check does not cover the app's templates, which `nuxt typecheck` reads ([Nuxt compatibility](/docs/proposals/refactors/vite-plus/nuxt-compatibility)). The checks run as their own CI jobs in any case, which the running-checks skill owns.
- **`prepare`, against `vp config`.** Ours is one `git config` line pointing Git at the committed hook directory; a hook dispatcher in its place is more machinery for the same result.
- **`outdated:dependencies`, against `vp outdated`.** The script is a report the repository's own tooling builds over the catalog, not a wrapper around a package manager's command.

## The script families are not part of this

The root manifest carries lint four ways, test and typecheck two ways each, because each variant encodes a filter or a fix flag. A task runner taking those as arguments looks like the cure, but pnpm already forwards arguments and filters, so `vp` does not unlock a collapse that is unavailable today. Whether the families should shrink is a question about which combinations are run often enough to deserve a name, and it is judged on that alone — not bundled into a toolchain migration where it would land on top of a moving target.

## What does not move

- **The sweep scripts.** Each one is a find recipe for a convention sweep, with its own tests. They are repository tooling, not toolchain.
- **`graph:gen`.** Generates the dependency graph image; bespoke and staying.
- **`release`.** Publishing stays with Lerna Lite, retained for publishing only. `vp pack` builds a library artifact; it does not do fixed-mode conventional-commit versioning across the public packages.
- **`bench`, `coverage`, `start`, `watch:packages`.** Thin wrappers over tools that run unchanged; `coverage` keeps its shard and blob flags because the suite keeps invoking Vitest directly.

## Windows-only scripts

`crossOS` and the PowerShell wrapper exist because development happens on a Windows host. If the [virrun retirement](/docs/proposals/refactors/vite-plus/virrun-retirement) decision moves that loop onto Linux, both are dead and are deleted in the same change rather than left as a fallback — a fallback nobody exercises is the thing that breaks silently. `refresh:lockfile` calls through `crossOS` and inherits that decision; it is a real need either way, so it survives, and only its platform branch goes. `update:node`'s install scripts, the other `crossOS` entry, went with `vp env`.

## The documentation this changes

Every command spelling above appears in prose somewhere, and prose is what nothing checks — a stale path fails the Key Files test, a stale command name fails nothing. So the sweep belongs to each phase rather than to a cleanup afterwards: the agent guide's command list, the package-scripts skill that owns script conventions, the running-checks skill that says which checks a session runs, and every area page that names a check by its script name. The full accounting is in [docs cleanup](/docs/proposals/refactors/vite-plus/docs-cleanup).

## Key files

| File                                      | Role after the change                                               |
| ----------------------------------------- | ------------------------------------------------------------------- |
| `package.json`                            | the build and check scripts run as cached tasks, the prefix removed |
| `apps/web/package.json`                   | the app's scripts, the deploy-entrypoint `build` kept by name       |
| `scripts/src/updateNode/index.ts`         | the pin-writing half of `update:node`, which survives `vp env`      |
| `.agents/skills/package-scripts/SKILL.md` | the script catalogue swept in the phase that changes a spelling     |

## Sources

- [Vite+](https://viteplus.dev), its [run guide](https://viteplus.dev/guide/run) and [lint guide](https://viteplus.dev/guide/lint) — what `vp run`, `vp check` and `vp fmt` do, and the pnpm-compatible filters.
- [Vite+ releases](https://github.com/voidzero-dev/vite-plus/releases) — `vp env` managing Node and the package manager together in place of Corepack.
