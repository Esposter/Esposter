# sandbox-runtime — Snapshot + Warm-Fork Layer

Freeze a warm sandbox (post-install, post-build) and clone it instantly for each subsequent run. The largest speed win.

## Overview

Booting a repo and installing deps is the slow part and it is identical across runs. Do it **once**, snapshot the warm state, then `fork()` a fresh isolated sandbox per command. Repeated runs skip install entirely.

```
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

## Key Files (planned)

| File | Role |
| ---- | ---- |
| `snapshot/Snapshot.ts` | snapshot handle + `fork()` |
| `snapshot/cache.ts` | lockfile-hash-keyed snapshot cache |
