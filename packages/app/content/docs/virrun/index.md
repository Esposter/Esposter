---
title: virrun
description: Ephemeral in-memory virtual runner — boot a repo into a RAM-backed filesystem, run its real toolchain isolated, then snapshot and fork the warm state.
---

# virrun

An ephemeral, in-memory virtual runner: boot any repo into a RAM-backed filesystem, run its **real toolchain** (pnpm, native addons, scripts) fast and isolated, then **snapshot and fork** the warm state so repeated runs are near-instant. It lives at `packages/virrun` and is published unscoped as `virrun`.

virrun is **not a virtual filesystem** — the VFS is a reused layer (`@platformatic/vfs`, later `node:vfs`). It **is a runtime**: the layer that runs real processes against that filesystem, isolates them, and snapshots/forks them.

## Design goals

Developer experience through speed — remove the two things that make the everyday toolchain slow:

- **Network-bound waits** — dependencies are fetched once into a shared store and reused; a warm snapshot skips install entirely.
- **Disk I/O** — files live in a RAM filesystem; `node_modules` and build output never touch real disk.

Plus: **ephemeral** (spin up / throw away, no polluted machine state), **reproducible** (same source + lockfile → same warm snapshot), **isolated** (a run cannot corrupt the host), and **drop-in** (existing commands run unchanged behind a single `virrun -- <cmd>` prefix).

## The two gates

Every backend and speed feature must pass two non-negotiable gates, both CI-enforced — a violation is not shippable, however clever:

1. **Faster than the native baseline** — tracked by committed `*.bench.md` artifacts diffed offline.
2. **Observably correct** — exit code, stdout/stderr, produced files, and dependency tree identical to running the command natively, enforced by a differential Vitest harness that hard-fails CI on any divergence.

Correctness beats speed; a fast wrong answer is worthless.

## Key concepts

- **Backend** — the one axis that changes what actually runs: `native` (host passthrough), `vfs` (in-process pure-JS over a virtual FS), `os` (real process exec inside a bubblewrap RAM overlay). See [execution backends](/docs/virrun/execution-backends).
- **The subprocess wall** — an in-process VFS is blind to child processes; only the `os` backend puts a real `pnpm install` in RAM. See [architecture](/docs/virrun/architecture).
- **Warm snapshot / fork** — "clone + install" happens once into an environment-keyed overlay layer (lockfile + sandbox node major); each run forks it. See [snapshot and fork](/docs/virrun/snapshot-and-fork).
- **Write-back** — a mutation command's produced files are flushed back to the host so disk matches native, while `node_modules` structurally never flushes. See [write-back](/docs/virrun/write-back).
- **Task cache** — a persist run keyed by environment key + working-tree + command hash; a hit skips the sandbox and replays the recorded diff and streams.
- **The prefix is the switch** — `virrun -- <cmd>` opts one command in; removing it opts out. No allowlist, no env flag.

## Pages

| Page                                                    | Covers                                                                            |
| ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [Architecture](/docs/virrun/architecture)               | system overview, the five layers, the subprocess wall, where the speed comes from |
| [Execution backends](/docs/virrun/execution-backends)   | the `ExecBackend` seam, virtual-FS layer, `vfs` and `os` backends                 |
| [Snapshot and fork](/docs/virrun/snapshot-and-fork)     | warm deps snapshot, source-keyed prepare layer, atomic publish                    |
| [Write-back](/docs/virrun/write-back)                   | native-equivalent persistence of a mutation command's output                      |
| [Task cache](/docs/virrun/task-cache)                   | content-keyed replay of unchanged persist runs, the two honesty guards            |
| [Task-cache eviction](/docs/virrun/task-cache-eviction) | age-prune the unbounded tasks dir, touch-on-hit recency, payload size in cache ls |
| [WSL source mirror](/docs/virrun/wsl-source-mirror)     | win32 ext4 source mirror + host-side manifest delta sync                          |
| [Adoption](/docs/virrun/adoption)                       | the prefix-is-the-switch model, opt-in levels, auto-fallback, CLI subcommands     |
| [Configuration](/docs/virrun/configuration)             | the committed `virrun.config.*` — backend selection + environment preset          |
| [Cache](/docs/virrun/cache)                             | the gitignored `.virrun` layout, probe caches, cleanup & self-healing             |
| [Correctness](/docs/virrun/correctness)                 | the correctness gate — differential, equivalence, and property/fuzz layers        |
| [Benchmarking](/docs/virrun/benchmarking)               | the speed gate — committed bench artifacts, methodology, honest numbers           |
| [Orchestrator API](/docs/virrun/orchestrator-api)       | the public `createVirrun` TypeScript surface                                      |
| [Prior art](/docs/virrun/prior-art)                     | surveyed landscape — what was adopted, studied, or ruled out                      |

Open work: [roadmap](/docs/virrun/roadmap). Decided ideas: [deferred](/docs/virrun/deferred) (not yet, trigger-gated) · [rejected](/docs/virrun/rejected) (won't do) — grep both before proposing anything.

## Shipped log

- **Foundations** — `ExecBackend` seam, native passthrough backend, async `createVirrun`, `dir`/`files`/`git` source loaders, the `virrun -- <cmd>` CLI, colocated `pnpm bench` artifacts.
- **VFS layer** — `FsProvider` over `@platformatic/vfs` (the lone import, doubling as the `node:vfs` swap shim); mounting patches `require`/`fs` to serve virtual files.
- **`vfs` backend** — runs `node -e` and `node <file>` in-process over the overlay FS, falling back to native for anything it cannot run faithfully.
- **`os` backend** — real process exec inside a rootless bubblewrap RAM overlay, a lazy content-addressable pnpm dep store, and the WSL2 bridge from Windows.
- **Snapshot + warm-fork** — environment-keyed overlay snapshot with atomic publish, exposed as `fork()` on the orchestrator.
- **Prepare layer** — a second, source-keyed overlay layer capturing framework codegen (`nuxt prepare` → `.nuxt`) so type-aware tooling reads Linux-generated artifacts.
- **Write-back** — a persist run reconciles its overlay upper onto the host so disk matches native; the default for a bare `virrun -- <cmd>`.
- **Task cache** — content-keyed replay of unchanged persist runs; default-on locally, off in CI.
- **Config backend selection** — committed `virrun.config.{ts,mts,js,mjs,json}` loaded via unconfig; this repo branches win32 → `os`, else `native`.
- **citty CLI** — `run`/`exec`/`warm`/`init`/`cache`/`doctor` subcommands; the bare `virrun -- <cmd>` prefix is the default `run`.
- **WSL ext4 source mirror + manifest delta sync** — win32 source reads move off v9fs onto an ext4 mirror kept fresh by a host-side manifest diff (no per-run 9p stat-walk).
- **Cross-process probe caches** — os-backend capability probe and win32 WSL environment probes persisted across processes.
- **Concurrency-safe cache** — pid-tagged temps, pid-liveness reaping, and per-run leases so concurrent runs never delete each other's files.
- **`virrun doctor`** — probes each `os`-backend prerequisite and prints an aligned per-check report.
- **Native-on-Linux CI** — the platform-branched config resolves `native` on Linux CI runners; the former warm-snapshot CI pipeline was removed.
- **Bench-truth** — corrected the speed story: no install bench group (the os install feeds the fork snapshot, not host disk), honest win32 numbers.
- **Task-cache eviction** — age-prune of the unbounded `tasks/` dir beside the temp reap, touch-on-hit recency so age reflects use, and payload size in `cache ls`.
