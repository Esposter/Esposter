---
title: Monorepo task runners
description: Rejected — adopting Turborepo, Nx, moon or wireit to derive per-package build cache keys automatically.
---

# Monorepo task runners

The `package-builds` cache key is [whole-set](/docs/architecture/monorepo-tooling): any real input change under a non-app package rebuilds every non-app package. The tools that fix that automatically are Turborepo, Nx, moon and wireit, and all four would slot in — none of them cares that the bundler is tsdown over rolldown, because they cache whatever a task declares as its outputs.

## What each would derive

| Tool          | Keys a task on                                                                                                 |
| :------------ | :------------------------------------------------------------------------------------------------------------- |
| **Turborepo** | The package's own files + the transitive hash of its workspace dependencies + declared env vars + the lockfile |
| **Nx**        | The same, plus an inferred project graph and `affected` filtering                                              |
| **moon**      | Per-task `inputs` / `outputs` declared explicitly                                                              |
| **wireit**    | Per-script `files` / `output`, staying inside npm scripts rather than replacing the runner                     |

Turborepo is the closest fit: pnpm workspaces are native to it, and per-package granularity keyed on the dependency graph is exactly the property this repo's hand-rolled key lacks.

## Why not

**The build it would make incremental is not what CI waits on.** `pnpm build:packages` builds every non-app package, topologically and in parallel, against an app build several times longer that gates the workflow either way — so per-package granularity would save a fraction of the one job nothing is waiting on. It would not even save that on every miss: the [whole-set key](/docs/architecture/monorepo-tooling) hashes every tracked file under a non-app package a build could read, so a lint-config edit rebuilds too, and per-package granularity narrows which packages rebuild without making those commits hit.

**It would be the third content-hash cache in the repo.** virrun's [task cache](/docs/virrun/task-cache) is already the Turborepo idea, and [prior art](/docs/virrun/prior-art) records it as such — content-keyed on lockfile, working tree and command. The `package-builds` entry is the second. A task runner's key would be a third, with its own notion of what an input is, and three caches that disagree about staleness fail in the direction that matters: one of them serves a `dist` the others would have rebuilt.

**Its cache would miss in CI anyway without remote caching.** A local task cache is a dev-loop lever — virrun's is off in CI precisely because a fresh commit changes the tree hash and hits are near zero. Getting CI value out of Turborepo means running a remote cache, which is either Vercel's or a self-hosted server to operate, for a build that is not the critical path.

**It replaces the orchestration we chose on purpose.** `pnpm -r` with filters is the documented mechanism, picked over Lerna Lite for the same reasons; `turbo run build` would put a second task graph in front of a workspace graph pnpm already resolves correctly.

## The revisit trigger

If `build:packages` ever stops finishing well inside the app build — the job that gates the workflow, and the reason the package build's own duration buys nothing today — granularity starts earning its keep, and the first step is still not a task runner. The existing key is a short `git ls-tree` pipeline in `get-build-cache-keys`, and the dependency order it would need is already what `pnpm -r` walks, so splitting it per package is a smaller change than adopting a runner and adds no third cache.

## What we take from it instead

The idea worth keeping is the one the current key already applies: **hash inputs by content, and let the tool subtract rather than enumerate.** Turborepo's default is to hash a package's whole tree and let you narrow it, not to make you list what matters — which is the reasoning behind this repo's subtract-list, arrived at independently and for the same reason.
