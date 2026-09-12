---
title: Commands
description: Every root script under the migration — which become `vp` tasks, which collapse into one another, and which stop existing.
---

# Commands

The root manifest carries a script per check, per build target and per filtered subset of each, and the subsets are where the count comes from: lint exists four times because it is crossed with two filters and a fix flag, and test and typecheck exist twice each for the same reason. A task runner that takes filters as arguments makes most of those spellings unnecessary.

This page is the inventory. It assumes the phases in order — a script only loses its `virrun --` prefix once [virrun retirement](/docs/proposals/refactors/vite-plus/virrun-retirement) has landed, and every row below that mentions the prefix is gated on it.

## The collapses

Four families account for most of the reduction, and in each case the script variants are encoding an argument.

| Family        | Today                                                    | After                                                             |
| :------------ | :------------------------------------------------------- | :---------------------------------------------------------------- |
| **Lint**      | `lint`, `lint:fix`, `lint:packages`, `lint:fix:packages` | `vp lint`, with `--fix` and a filter as arguments                 |
| **Test**      | `test`, `test:packages`                                  | one task; the project selector is an argument, as it already is   |
| **Typecheck** | `typecheck`, `typecheck:packages`                        | one task plus a filter                                            |
| **Build**     | `build`, `build:packages`                                | `vp run build` with a filter, plus the one deploy-entrypoint name |

The build family does not collapse as far as the others, and the exception is worth stating because it looks like an inconsistency. The bare `build` means the app rather than the workspace, deliberately: the deploy platform runs `pnpm build` as its default build command, so that name is a deploy entrypoint rather than a developer convenience, and widening it would have every deploy build two bundles it does not ship. That reasoning is unchanged by the migration, so one specifically-named task survives for it.

## What `vp check` absorbs

`vp check` runs formatting, linting and type-checking in one pass. That is three of the four steps this repository's own finishing ritual currently names separately, and the ritual is written down in more than one place — the agent guide's step ordering, the context-efficiency skill's rule about batching them at the end, and the release chain.

The release chain is the one that needs care rather than a find-and-replace. Every step in it is a check rather than a fix, on purpose: the fix variants led that chain once, which made a release rewrite the tree it was about to publish, and whatever they changed shipped under the new version and got tagged without anyone reading it. So the chain may adopt `vp check` only in its non-writing form, and the property to preserve is that **a release fails on a dirty tree rather than tidying it**. Any replacement that runs a formatter in fix mode is a regression, however much shorter it reads.

The ordering constraint inside that chain also survives: the format check is the only step that can run cold, because everything after it reads what the build writes — the generated barrels and `dist` are both gitignored, so from a clean checkout lint and typecheck resolve nothing and the size snapshots measure no bundle.

## What `vp` subsumes outright

| Script                   | Replaced by                | Caveat                                                                                     |
| :----------------------- | :------------------------- | :----------------------------------------------------------------------------------------- |
| `format`, `format:check` | `vp fmt`, `vp fmt --check` | the check must declare no dependency on any build task, or it stops being the quickest job |
| `prepare`                | `vp config`                | it installs a Git hook dispatcher; the existing hook path must survive the swap            |
| `outdated:dependencies`  | `vp outdated`              | only if the bespoke script's output is not doing something `vp outdated` does not          |
| `update:node`            | `vp env`, partly           | see below — this one does not fully transfer                                               |

`update:node` is the interesting failure. It is not merely "install a Node version": it writes **two** pins in the root manifest, because `devEngines.runtime` is what the CI setup action reads to provision a runner and `engines.node` is what every other tool reads, and it writes the matching type-definitions entry in the catalog at the same time. Never editing one pin alone is the rule, and a run of that script is the only thing permitted to write either.

`vp env` owns the runtime half. It does not know about this repository's second pin or its catalog entry, so either the script survives in reduced form — writing the pins and delegating the install — or the pins are proven redundant, which is a separate investigation with its own answer. Assuming `vp env` covers it is how one of the two pins silently goes stale, and the failure surfaces as CI provisioning the wrong runtime.

## What does not move

- **The sweep scripts.** Each one is a find recipe for a convention sweep, with its own tests. They are repository tooling, not toolchain, and a task runner has nothing to say about them beyond running them.
- **`graph:gen`.** Generates the dependency graph image; bespoke and staying.
- **`release`.** Publishing stays with Lerna Lite, which is retained for publishing only and for nothing else. `vp pack` builds a library artifact; it does not do fixed-mode conventional-commit versioning across the public packages.
- **`bench`, `coverage`, `start`, `watch:packages`.** Thin wrappers over tools that Vite+ either already is or does not touch.

## Windows-only scripts

`crossOS` and the PowerShell wrapper exist because development happens on a Windows host. If the [virrun retirement](/docs/proposals/refactors/vite-plus/virrun-retirement) decision moves that loop onto Linux, both are dead and should be deleted in the same change rather than left as a fallback — a fallback nobody exercises is the thing that breaks silently, and the repository's own standard is that superseded content is deleted rather than kept.

`refresh:lockfile` calls through `crossOS` and therefore inherits that decision. It is a real need either way, so it survives as a task; only its implementation stops needing a platform branch.

## The documentation this changes

Every command spelling above appears in prose somewhere, and prose is what nothing checks — a stale path fails the Key Files test, a stale command name fails nothing. So the sweep is part of each phase and not a cleanup afterwards: the agent guide's command list, the package-scripts skill that owns script conventions, the context-efficiency skill's batching rule, and every area page that names a check by its script name. The full accounting is in [docs cleanup](/docs/proposals/refactors/vite-plus/docs-cleanup).
