# virrun — Snapshot + Warm-Fork Layer

Freeze a warm sandbox (post-install, post-build) and clone it instantly for each subsequent run. The largest speed win.

## Overview

Booting a repo and installing deps is the slow part and it is identical across runs. Do it **once**, snapshot the warm state, then `fork()` a fresh isolated sandbox per command. Repeated runs skip install entirely.

```text
boot + install (once, slow) ─► snapshot ─► fork ─► run cmd ─► dispose
                                        └─► fork ─► run cmd ─► dispose   (near-instant)
```

## Mechanisms by backend

- **`vfs` backend**: serialize the in-memory FS volume; fork = clone the volume (copy-on-write where possible). Process state is not preserved — only files.
- **`os` backend**: two options to evaluate —
  - **overlay-layer snapshot** _(realized, FS-only)_: a capture run persists the post-install writes into a real overlay upper (`bwrap --overlay <upper> <work> <dir>`); a fork run stacks that frozen upper as a read-only `--overlay-src` lower beside the source and tops it with a fresh `--tmp-overlay` so its own writes vanish. Cheap, no CRIU. **The snapshot upper must live outside the source tree** — overlayfs rejects a lower that nests inside another, so a `<cwd>/.virrun/snapshots` layer fails at fork; it lives in the host-global cache instead (see Caching).
  - **CRIU** (checkpoint/restore): freeze the whole process tree + FS for a truly warm fork (daemons already running). Stronger, heavier.
  - microVM snapshot (Firecracker) for the multi-tenant path.

## Caching

- Snapshot cache keyed by **lockfile hash** (+ base image id, deferred) and stored in the **host-global** cache root `~/.virrun/snapshots/<hash>` (override with `VIRRUN_CACHE_HOME`) — not under the repo's `.virrun/`. Global both because the overlay layer may not nest inside the source tree (above) and because the same deps then reuse one warm snapshot across repos/CI runs. The repo-local `.virrun/store` (dep store) stays put — it is bind-mounted, and binds may overlap the overlay.
- Evict by LRU + total RAM budget.
- In CI the snapshot dir is persisted across runs by `actions/cache` keyed by the lockfile hash — a reusable `warm-snapshot.yaml` captures it once (cold install) and the os-backend jobs restore it read-only and `fork()`, so a run installs once instead of once per job. Those jobs skip the host `pnpm i` entirely (`setup-packages install: false`) since the fork supplies node_modules; the copy-mode upper is self-contained, so only `~/.virrun/snapshots` is cached (not the repo-local `.virrun/store`, which a fork recreates empty). → [virrun CI](https://github.com/Esposter/Esposter/blob/main/packages/virrun/readme/ci.md#snapshot-cache) · [config-and-cache](config-and-cache.md#virrun-cache--gitignored)

## Prepare layer (realized — source-keyed generated artifacts)

The deps snapshot is keyed on the **lockfile** and must freeze only what the lockfile determines. Framework codegen a postinstall writes into the source tree (Nuxt's `.nuxt`) is **source**-derived, and on a win32 host it is also **platform**-specific: the host's win32-generated `.nuxt` makes a Linux sandbox's type-aware linter collapse types to `any` (a phantom `no-unnecessary-type-parameters`), even though it is fine natively. `pruneSnapshotUpper` strips it from the deps snapshot; a **second overlay layer** owns it instead.

- **Keyed by lockfile + source-tree hash + the resolved prepare step** (`resolvePrepareLocation`, reusing `computeSourceTreeHash` — the same git-based working-tree hash as the task cache). A source edit re-keys and rebuilds _this_ layer only; the deps snapshot is untouched (no reinstall).
- **Built by `createPrepareLayer`**: fork the deps snapshot as a read-only lower, run the environment's prepare command (`nuxt prepare`), keep only the declared `outputs` (`pruneToOutputs` — the inverse of `pruneSnapshotUpper`), then atomically publish (same per-pid temp + rename barrier). The sandbox thus owns a **Linux-generated** `.nuxt` matching current source.
- **Stacked last** in the fork/persist `lowerDirs` (`[depsUpper, prepareUpper]`): the last `--overlay-src` wins, so it shadows both the deps lower and the host's source copy. The WSL source mirror excludes the outputs so the host copy never enters the sandbox and the capture is complete (nothing read through a host lower).
- **Selected by the `environment` preset** — `none` (default) means no layer; `nuxt` → `resolvePrepareStep` detects the nuxt package by its git-tracked `nuxt.config`. Preset-driven, no overrides. Persist write-back masks the outputs like `node_modules` (cache-owned, never flushed to the host). → [config-and-cache](config-and-cache.md#virrun-cache--gitignored) · [write-back](write-back.md)
- Superseded entries are swept by `pruneStalePrepareLayers`, pinning the cache to the live source state.
- **Resolved once per fork/persist.** `ensurePrepareLayer` calls `resolvePrepareLocation` a single time, prunes superseded entries, re-reads `existsSync(upperDir)` **after** the prune (not the pre-prune `exists` snapshot), builds via `createPrepareLayer` if absent — passing that same location so the layer publishes exactly where it will be mounted — and returns that `upperDir` as the lower to stack. One resolve means fork/persist can never key off a source-tree hash that shifted between a "does it exist" check and the mount, which would otherwise stack a `prepare/<key>/upper` that was never built (bwrap then fails with `Can't find source path`).

## Constraints / Notes

- Start FS-only (overlay-layer / volume clone); add CRIU process-state forking only if measured warm-boot time justifies it.
- Snapshot integrity must survive dep-store changes — bind the snapshot to the exact store content it was built against.
- Generated artifacts that are both source- and platform-specific never belong in the lockfile-keyed deps snapshot: they go in the source-keyed prepare layer, regenerated in-sandbox for the sandbox's own platform (the win32-host `.nuxt` phantom is the motivating case).

## Concurrency safety (realized — atomic publish)

`exists: existsSync(upperDir)` is the readiness signal every `resolveSnapshotLocation` / `forkSnapshot` reads, so it must only ever flip true on a **finished** layer. `createSnapshot` captures into per-pid temps under `<hash>/` (`upper.<pid>.tmp` + `work.<pid>.tmp`), runs the setup command there, then a single `renameSync` promotes the temp upper onto the final `<hash>/upper`. Rename is the publish barrier — a concurrent reader sees either no upper or the complete one, never a half-built install in place.

- Both temp dirs are per-pid, so parallel capturers never share an overlay upper/work. A capturer that loses the race finds `upperDir` already published, keeps that equivalent layer, and drops its own temp.
- Teardown removes **only the capturing process's own temps** (never the shared `<hash>/` root), so a failure or redundant capture can't delete a sibling's published or in-flight layer.

## Key Files

Realized: the FS-only overlay snapshot — lockfile-hash cache addressing, the overlay-layer argv, `createSnapshot` capture and `forkSnapshot` (Linux + WSL), the cold-vs-warm bench, and a transparent `fork()` on the `createVirrun` orchestrator (os captures-or-reuses; other backends fall through to `exec`). Still planned: always-on whole-repo routing on top of this handle, gated on a viable transparent-interception seam (the PATH shim is dropped as unviable).

| File | Role | Status |
| ---- | ---- | ------ |
| `services/exec/snapshot/computeLockfileHash.ts` | sha256 of `pnpm-lock.yaml` — the snapshot cache key | realized |
| `services/exec/snapshot/resolveSnapshotLocation.ts` | resolve `~/.virrun/snapshots/<hash>` (+ `upper` dir, `exists`) — pure addressing | realized |
| `services/exec/util/getGlobalCacheDirectory.ts` | host-global cache root `~/.virrun` (`VIRRUN_CACHE_HOME` override) | realized |
| `services/exec/bwrap/buildBwrapArgs.ts` (`OverlayLayers`) | emit stacked `--overlay-src` lowers (fork) + persisted `--overlay` upper (capture) vs `--tmp-overlay` (ephemeral) | realized |
| `services/exec/snapshot/createSnapshot.ts` | run a setup command in capture mode, persisting post-install writes into a per-pid temp upper then atomically renaming it into place (Linux + WSL) | realized |
| `services/exec/snapshot/forkSnapshot.ts` | run a command over a captured snapshot (upper stacked read-only, writes vanish); guards that one exists | realized |
| `services/exec/snapshot/removeSnapshotDirectory.ts` | recursively remove a snapshot dir (capture temp or `<hash>` root), chmod-ing the overlay `work/work` scratch traversable first | realized |
| `localMonorepo.platform.bench.ts` (typecheck/build/test fork groups) | speed gate: fork the warm snapshot to run the real command vs the native baseline, one committed artifact per platform | realized |
| `services/virrun/createVirrun.ts` (`fork`) | transparent `fork(command)` on the orchestrator handle — os captures-or-reuses the snapshot (and the prepare layer), other backends fall through to `exec` | realized |
| `services/exec/snapshot/resolvePrepareLocation.ts` | resolve `~/.virrun/prepare/<key>` (lockfile + source-tree + prepare-step key) — pure addressing | realized |
| `services/exec/snapshot/createPrepareLayer.ts` | fork the deps snapshot, run the prepare command, keep only `outputs`, atomically publish to the caller's resolved location (not a re-resolve) | realized |
| `services/exec/snapshot/pruneToOutputs.ts` | strip a prepare capture down to the declared output subtrees (inverse of `pruneSnapshotUpper`) | realized |
| `services/exec/snapshot/pruneStalePrepareLayers.ts` | evict superseded source-keyed prepare layers | realized |
| `services/configuration/resolvePrepareStep.ts` (`Environment`) | resolve the `environment` preset to a `{ command, outputs }` step (nuxt → detect `nuxt.config`) | realized |
| always-on whole-repo routing | a single switch / spawn-interceptor forking every command | planned (gated on a viable interception seam → [deferred/whole-repo-routing.md](../deferred/whole-repo-routing.md)) |
