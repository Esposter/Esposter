# virrun — WSL ext4 Source Mirror

On win32, read the repo source from a WSL-native ext4 mirror instead of straight from `/mnt/c`, so an `os`/wsl run stops paying the v9fs read tax on every source file.

## Overview

The shipped WSL bridge moved the write-heavy caches (pnpm store, snapshot overlay dirs, corepack home) onto WSL ext4, but the **source lower is still `/mnt/c`**: `createWslBwrapArgs` sets `wslDir = readWslPath(resolveCwd(cwd))`, and that path is used as both `--chdir` and the `--overlay-src` read-only lower (`buildBwrapArgs.ts:45`). So every fork re-reads the whole source tree — and the toolchain's own file reads (tsc, vitest, eslint walking the tree) — over 9p/v9fs, documented at 15–64× slower than ext4. That is the cause of the win32 gap: `os/wsl` benches at **0.06–0.31× native** vs Linux's 0.76–0.95× (`localMonorepo.platform.bench.win32.md`), and the Phase 7 "overhead is inherent overlayfs cost, stop squeezing" verdict was measured on **ext4 only** — it never covered the v9fs source read.

Fix: keep a per-repo ext4 mirror of the working tree under the existing WSL native cache root, incrementally sync it (host → mirror) before each run, and point `--overlay-src`/`--chdir` at the mirror. Reads now hit ext4 at native speed; write-back is unaffected because its flush target is derived independently from `options.cwd`.

## Why this is contained

`persistRun` already computes its flush target as `hostDir = options.cwd` and hands it to `applyFlushPlan` (`persistRun.ts:35,48`), which translates it to `/mnt/c` Linux-side. That is **separate** from the path `createWslBwrapArgs` picks for the overlay lower. So swapping the overlay lower to the mirror does not touch write-back: the upper diff (mirror-relative, same layout as host) still flushes onto the real host working dir. No change to `buildBwrapArgs`, `ExecOptions`, or the flush plan.

The mirror is also read by `createSnapshot` capture (it routes through the same `createWslBwrapArgs`), so the one-time `pnpm install` manifest walk (many small `package.json` reads across the workspace) also moves off v9fs for free.

## Mechanism

1. **Mirror location** — `<wslNativeCacheRoot>/sources/<sha256(hostCwd)>/`, a sibling of `snapshots/` and `store/` under the ext4 root (`getWslNativeCacheRoot.ts`). Keyed by the host working-dir absolute path so distinct repos/worktrees never collide. `ensureWslSourceMirror` returns the `/home/...` Linux path (same UNC→path shape as the cache root).
2. **Incremental sync** — `wsl.exe --exec rsync -a --delete <mnt-c-src>/ <mirror>/` reading the `/mnt/c` source, writing the ext4 mirror. `-a` + default mtime/size quick-check copies only changed files; `--delete` drops files removed on the host, keeping the mirror == working tree. First run is a full materialize (one-time, ~a local git clone); every run after is a delta.
3. **Excludes** — `node_modules` (supplied by the snapshot RO lower — never belongs in the source lower, mirrors the write-back rule) and `.git` (large, churns every commit, unread by the dev-loop commands). Everything else is mirrored: **over-copy is correctness-safe, under-copy is a bug**. Build outputs (`dist`, `.nuxt`, …) stay in scope — the toolchain may read them and they are cheap deltas.
4. **Concurrency** — the sync takes an exclusive per-mirror `flock`; a running fork holds a shared lock for its duration so a concurrent sync can't mutate the RO lower mid-read. Concurrent forks (shared lock) run in parallel; only a sync serializes.
5. **Platform gate** — win32/WSL only. Native Linux source already lives on ext4 (or the host FS), so `createLinuxOsBackend` keeps `--overlay-src` on the real source, no mirror, no sync.

## Key Files

| File                                                         | Role                                                                                                                 | Status             |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `services/exec/wsl/ensureWslSourceMirror.ts`                 | resolve `<cache>/sources/<key>`, flock, rsync host→mirror, return the ext4 `/home/...` path                          | new                |
| `services/exec/wsl/createWslBwrapArgs.ts`                    | use `ensureWslSourceMirror(resolveCwd(cwd))` for `--overlay-src`/`--chdir` instead of `readWslPath(resolveCwd(cwd))` | edit (`:24`)       |
| `services/exec/snapshot/persistRun.ts`                       | unchanged — flush target `hostDir = options.cwd` is already independent of the overlay lower                         | unchanged (verify) |
| `services/exec/os/probeOsBackendChecks.ts` (`virrun doctor`) | add an `rsync` presence check in the WSL login shell                                                                 | edit               |
| `localMonorepo.platform.bench.win32.md`                      | re-run `pnpm bench` to quantify the win32 lift                                                                       | regenerate         |

## Constraints / Notes

- **Goal is closing the v9fs gap, not guaranteed native-beating on win32.** The run still pays a sync stat-walk over v9fs each time (rsync stat-ing the `/mnt/c` tree) plus sandbox overhead, against native's local NTFS reads. Expect win32 `os/wsl` to move from 0.06–0.31× up toward the Linux 0.76–0.95× band; whether it crosses 1.00× depends on delta size. Report the measured numbers honestly — do not claim a win the bench doesn't show (Phase 6 bench-truth rule).
- **rsync stat-walk is the residual cost.** For git repos it can be eliminated by driving the delta from git introspection instead of a full tree stat — virrun already enumerates the working tree on the host (`git ls-files -s` + `git diff --binary` + untracked) for the task-cache key, the exact same "differs from clean" set. Deferred as an optimization, not the first cut (keeps the mechanism generic-any-repo).
- **Mirror eviction** shares the snapshot cache's LRU + RAM/disk budget; `cache clean` must sweep `sources/` too.
- **Absolute host paths inside a command** would resolve against the mirror, not the host tree. The dev-loop commands use cwd-relative paths, so this is a documented edge, not a blocker.
- **Rejected: copy source into the snapshot.** The snapshot is keyed by lockfile hash and reused across many source states; folding mutable source into the immutable install layer breaks the cache model. The mirror must be per-repo and separately synced.
- **Rejected: full copy per run.** Defeats the point — a cross-boundary full write each run costs more than the reads it saves. Incrementality is load-bearing.

## End-To-End Plan

- **Today**: win32 `os`/wsl works and is correct, but slow — every source read crosses v9fs. Linux is unaffected.
- **Rollout**: (1) `ensureWslSourceMirror` + flock + rsync; (2) wire into `createWslBwrapArgs`; (3) `rsync` check in `virrun doctor`; (4) extend `cache clean` to `sources/`; (5) re-run the win32 bench and record the lift.
- **Correctness**: the existing differential + write-back equivalence corpora already run on win32 and gate this — the mirror must produce byte-identical results and flush shapes vs native. No new correctness seam; if the mirror is stale or mis-synced, those tests fail.
- **Failure/retry**: a failed sync (rsync missing, ext4 full) surfaces via `virrun doctor` and aborts the run before exec — never a silent partial mirror. No `os` → native fallback here (the `os` backend never falls back by design); a broken mirror is a hard error.
- **Unsupported until later**: git-diff-driven sync (rsync stat-walk stays for now); mirror sharing across worktrees of the same repo (keyed by exact cwd).
