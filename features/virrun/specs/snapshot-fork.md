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
  - **overlay-layer snapshot**: freeze the `tmpfs` upperdir as a new lower layer; fork = new tmpfs upperdir on top. Cheap, FS-only.
  - **CRIU** (checkpoint/restore): freeze the whole process tree + FS for a truly warm fork (daemons already running). Stronger, heavier.
  - microVM snapshot (Firecracker) for the multi-tenant path.

## Caching

- Snapshot cache keyed by **lockfile hash** (+ base image id). Same deps → reuse the warm snapshot across repos/CI runs.
- Evict by LRU + total RAM budget.

## Constraints / Notes

- Start FS-only (overlay-layer / volume clone); add CRIU process-state forking only if measured warm-boot time justifies it.
- Snapshot integrity must survive dep-store changes — bind the snapshot to the exact store content it was built against.

## Key Files

Realized so far is the FS-only foundation: lockfile-hash cache addressing plus the overlay-layer argv the capture/fork runs will spawn (both gates-friendly, unit-tested cross-platform). The native capture/fork orchestration and a `Snapshot` handle are still planned.

| File | Role | Status |
| ---- | ---- | ------ |
| `services/exec/snapshot/computeLockfileHash.ts` | sha256 of `pnpm-lock.yaml` — the snapshot cache key | realized |
| `services/exec/snapshot/resolveSnapshotLocation.ts` | resolve `.virrun/snapshots/<hash>` (+ `upper`/`work` dirs, `exists`) | realized |
| `services/exec/bwrap/buildBwrapArgs.ts` (`OverlayLayers`) | emit stacked `--overlay-src` lowers (fork) + persisted `--overlay` upper (capture) vs `--tmp-overlay` (ephemeral) | realized |
| `services/exec/snapshot/createSnapshot.ts` | capture warm post-install state into the overlay upper (Linux + WSL) | planned |
| `snapshot/Snapshot.ts` | snapshot handle + `fork()` wired into the orchestrator | planned |
