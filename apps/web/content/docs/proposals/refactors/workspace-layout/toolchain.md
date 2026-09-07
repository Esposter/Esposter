---
title: The toolchain after the split
description: The scripts, workflows and configs that simplify once a role is a directory — and the CI argument for building an app inside the job that ships it.
---

# The Toolchain After The Split

This is the pull request the refactor exists for. Every exclusion whose only job was to say "not the app" is deleted, because the tree says it instead — and what replaces them is not another filter but the plain thing each script and each workflow was reaching for: the directory it actually wants.

## Root scripts

**No script is renamed, and none has to be.** Every `:packages` script keeps its name and finally deserves it, because the selector underneath stops excluding an identity and starts naming a directory. pnpm already selects that way — `--filter "./packages/*"` resolves a directory glob against the workspace:

| Script               | Selector today                                   | Selector after                  |
| -------------------- | ------------------------------------------------ | ------------------------------- |
| `build:packages`     | `--filter "!@esposter/web"`                      | `--filter "./packages/*"`       |
| `typecheck:packages` | `--filter "!@esposter/web"`                      | `--filter "./packages/*"`       |
| `watch:packages`     | `--filter "!@esposter/web"`                      | `--filter "./packages/*"`       |
| `test:packages`      | `--project "!@esposter/web"`                     | `--project "packages/*"`        |
| `lint:packages`      | `--ignore-pattern "apps/web/**"` plus the filter | the positional `packages` alone |
| `lint:fix:packages`  | `--ignore-pattern "apps/web/**"` plus the filter | the positional `packages` alone |

The two lint scripts are the clearest case: they already pass `packages` as the path to lint, then subtract a subdirectory of the path they just named. Once the app is not under it, the subtraction is the empty statement it always wanted to be. Every one of these is now an **inclusion**, so a library added later is inside it and an app added later is outside it, with nothing edited either way.

`test:packages` reaches that form only if the projects are renamed, and that is a change this pull request has to make rather than one the move hands it. Vitest's `--project` patterns are wildcards over a project's _name_, and a project that declares no `test.name` takes the name in its nearest manifest — so the names today are `@esposter/configuration`, `azure-mock`, `parse-tmx`, `virrun`, and `--project "packages/*"` would select none of them. What makes the pattern work is that `*` compiles to `.*`, so it crosses a `/` like any other character and a name may be a path. **The shared factory therefore starts naming the project after the caller's own directory** — `getVitestConfiguration(import.meta.dirname)`, resolved against the repository root, so `packages/azure` names itself — and the app's config, which builds its own project through `defineVitestProject` rather than the factory, sets the same `test.name` by hand. `--project` then addresses the tree exactly as `--filter` does.

### One script per addressable set

An app is addressed by its own name rather than by everyone else's absence, so each gets the scripts it needs — `build:web`, `build:functions`, `build:infra`, `test:web`, `test:infra` — every one of them a single directory named once:

```bash
pnpm build:packages     # --filter "./packages/*"    — the libraries, topologically
pnpm build:functions    # --filter "./apps/functions" — what the Functions deploy ships
pnpm test:packages      # --project "packages/*"     — every library suite
pnpm test:web           # --project "apps/web"       — the Nuxt suite, the slow one
```

That is what makes the CI section below possible: a workflow calls the script for the thing it is shipping, instead of calling a build of everything and using a third of it. The set is symmetric rather than long — one entry per app beside the one entry for the libraries — and each new script replaces a filter that would otherwise have had to learn a new name.

## Configs

| Config                   | What goes                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `typedoc.config.js`      | The app leaves the `exclude` list — its entry points are `packages/*`, which no longer contains an app  |
| `eslint.config.js`       | Ignores both product roots for one reason, that a member lints itself with its own flat config          |
| `vitest.config.ts`       | Projects become a glob per root; the hand-written entry for `scripts` goes with the next pull request   |
| `getVitestConfiguration` | Takes the caller's directory and sets `test.name` to it, replacing the manifest name Vitest defaults to |
| `.oxlintrc.json`         | Nothing is deleted — the app-tree overrides move with the app and keep doing their job                  |

## CI

```mermaid
flowchart TD
  H["git ls-tree over packages/ — mode, blob hash, path"] --> PK["package key"]
  H --> AK["app key = package inputs + apps/web"]
  PK --> PG{"cache hit?"}
  AK --> AG{"marker hit?"}
  PG -->|yes| PR["restore dist + barrels, verify, upload artifact"]
  PG -->|no| PB["install libraries, build, seed cache"]
  AG -->|yes| AS["skip — this tree already built green"]
  AG -->|no| AB["install, download artifact, nuxt build, write marker"]
  PR --> AG
  PB --> AG
```

The shape is the one that already runs; what changes is that neither key subtracts anything. Today the package key is a hash of `packages/` with `apps/web` removed from it, because no consumer of that cache builds the app. After the move the app is not in the hashed tree, so the package key is a hash of `packages/`, and an app's key is that hash plus that app's own directory — which is the rule a second app follows without any of this being touched.

Both `verify-package-builds` and the artifact path list keep globbing `packages/*`, and both become exactly right by doing nothing: the set they discover is the set the cache holds, with no app in it to have been an exception.

### An app builds in the job that ships it

The Functions deploy and the Pulumi job restore the shared artifact today and find their own `dist` inside it, because `build:packages` builds every member. After the split it builds libraries, and each of those jobs runs its own `build:functions` or `build:infra` on top of the artifact it already downloads, into an install it already performs.

**This is a saving on the common path, and the reason is what an app's `dist` is.** Nothing imports it — that is the definition of an entrypoint, and the whole basis of the split — so it is deploy payload and nothing else. Today it is built into an artifact that lint, typecheck, bench, the app build and every coverage shard download, none of which can read it. Two builds and their bytes are therefore repeated across the whole fan-out of every run, to be used by the two jobs that run on a deploy.

Against the bar in [monorepo tooling](/docs/architecture/monorepo-tooling), that is exactly the shape it counts against: work repeated where it is not read. Removing it shortens `build:packages` on every cache miss, shrinks the artifact for every job downstream of it, and leaves each app's build happening once, in the workflow that ships it, on the days that workflow runs.

The cost is one line long and worth stating plainly: a deploy no longer finds its `dist` prebuilt, so it pays its own small tsdown build unconditionally instead of inheriting one from a cache hit. Deploys are the rare path and the build is seconds. Nothing new is skipped, so the failure worth fearing — a job reporting green over work it did not do — is untouched.

Correctness gains something too. A deploy stops reading its payload out of a cache entry keyed for someone else's purpose: that entry exists so library consumers can skip a build, and the day an app's inputs stop being inside its key is the day a deploy ships a stale artifact and passes. After this, each workflow builds what it ships from the source it checked out.

**The alternative is worth recording, because it is the tempting one.** The apps could stay in the shared artifact by adding `apps/functions` and `apps/infra` to the key inputs and `apps/*/dist` to the paths. That keeps the deploy's free `dist` — at the price of keeping the unread payload in every other job's download, and of putting an enumeration of app names back into the definition this refactor exists to remove, in the one place where getting it wrong is silent. Two named directories in a cache key is exactly the shape of the filters being deleted upstairs.

No cache gate is proposed for those two builds. Gating something measured in seconds behind a content hash spends more on the gate than the build.

## Key files

| File                                                   | Role after the change                                                       |
| ------------------------------------------------------ | --------------------------------------------------------------------------- |
| `package.json`                                         | Root scripts, addressing libraries by path                                  |
| `.github/actions/get-build-cache-keys/action.yaml`     | Both keys, each a plain statement of its inputs                             |
| `.github/actions/verify-package-builds/action.yaml`    | Discovers buildable libraries by their tsdown config — unchanged, now exact |
| `.github/workflows/deploy-function-app.yaml`           | Builds the Functions app it deploys, on top of the library artifact         |
| `.github/workflows/Pulumi.yaml`                        | Builds the infra program it runs, on top of the library artifact            |
| `typedoc.config.js`                                    | Entry points over the libraries, with no app to exclude                     |
| `packages/configuration/src/getVitestConfiguration.ts` | The shared factory, taking a directory and naming the project after it      |
