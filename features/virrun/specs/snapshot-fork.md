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

## Constraints / Notes

- Start FS-only (overlay-layer / volume clone); add CRIU process-state forking only if measured warm-boot time justifies it.
- Snapshot integrity must survive dep-store changes — bind the snapshot to the exact store content it was built against.

## Concurrency safety (hardening — non-blocking follow-up)

The realized capture has a publish race. `resolveSnapshotLocation` reports `exists: existsSync(upperDir)`, but `createSnapshot` does `mkdirSync(upperDir)` **before** running the long setup command in-place, and only sets `exists: true` on success. So once mkdir lands, a concurrent `forkSnapshot` / `resolveSnapshotLocation` sees `exists === true` mid-install and stacks a half-built upper read-only. No lock, ready-marker, or atomic promotion gates the window. (Failure teardown via `removeSnapshotLocation` is fine — the gap is during a *successful* in-progress capture.)

- **Severity: low for the CLI flow.** One fork per `virrun` invocation, so it needs two separate virrun processes cold-starting against the same lockfile hash at nearly the same instant.
- **Still real, not dismissable:** `fork` is public API (not CLI-only), and parallel CI/tasks can drive the inter-process race even with CLI-only usage.
- **Fix:** capture into a temp dir (e.g. `<hash>/upper.tmp.<pid>`), then atomically `rename` it onto `<hash>/upper` — rename is the publish barrier; `existsSync(upperDir)` then only ever sees a finished layer. Optionally a per-hash lockfile/ready-marker so a second cold caller waits rather than racing a redundant capture. Build into the snapshot cache path rather than retrofitting.

## Key Files

Realized: the FS-only overlay snapshot — lockfile-hash cache addressing, the overlay-layer argv, `createSnapshot` capture and `forkSnapshot` (Linux + WSL), the cold-vs-warm bench, and a transparent `fork()` on the `createVirrun` orchestrator (os captures-or-reuses; other backends fall through to `exec`). Still planned: always-on whole-repo routing on top of this handle, gated on a viable transparent-interception seam (the PATH shim is dropped as unviable).

| File | Role | Status |
| ---- | ---- | ------ |
| `services/exec/snapshot/computeLockfileHash.ts` | sha256 of `pnpm-lock.yaml` — the snapshot cache key | realized |
| `services/exec/snapshot/resolveSnapshotLocation.ts` | resolve `~/.virrun/snapshots/<hash>` (+ `upper`/`work` dirs, `exists`) | realized |
| `services/exec/util/getGlobalCacheDirectory.ts` | host-global cache root `~/.virrun` (`VIRRUN_CACHE_HOME` override) | realized |
| `services/exec/bwrap/buildBwrapArgs.ts` (`OverlayLayers`) | emit stacked `--overlay-src` lowers (fork) + persisted `--overlay` upper (capture) vs `--tmp-overlay` (ephemeral) | realized |
| `services/exec/snapshot/createSnapshot.ts` | run a setup command in capture mode, persisting post-install writes into the overlay upper (Linux + WSL) | realized |
| `services/exec/snapshot/forkSnapshot.ts` | run a command over a captured snapshot (upper stacked read-only, writes vanish); guards that one exists | realized |
| `localMonorepo.bench.ts` ("warm fork vs cold reinstall") | cold-vs-warm speed gate: reinstall every run vs fork the snapshot (native Linux) | realized |
| `services/virrun/createVirrun.ts` (`fork`) | transparent `fork(command)` on the orchestrator handle — os captures-or-reuses the snapshot, other backends fall through to `exec` | realized |
| always-on whole-repo routing | a single switch / spawn-interceptor forking every command | planned (gated on a viable interception seam → [deferred/whole-repo-routing.md](../deferred/whole-repo-routing.md)) |
