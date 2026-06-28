# virrun

An ephemeral, in-memory virtual runner: boot any repo into a RAM-backed filesystem, run its **real toolchain** (pnpm/npm, native addons, scripts) fast and isolated, then **snapshot and fork** the warm state so repeated runs are near-instant.

Standalone OSS project (eventually its own repo / `packages/virrun*`); design docs incubate here. This README is the index.

## What it is — and is not

- **Not a VFS.** The virtual filesystem is a _reused_ layer (`node:vfs` / `@platformatic/vfs`), not the product.
- **It is a runtime.** The product is the layer that **runs real processes** against that FS, isolates them, and snapshots/forks them. node:vfs _stores_ files; this _runs_ the toolchain over them.

## Design goals

The point is **developer experience through speed** — make the everyday toolchain (install, build, test, lint) dramatically faster by removing the two things that make it slow:

- **Network-bound waits** — deps are fetched once into a shared store and reused; a warm snapshot skips install entirely. Re-runs don't re-download.
- **Disk I/O** — files live in a RAM filesystem; `node_modules` and build output never touch real disk.

Plus: **ephemeral** (spin up / throw away, no polluted machine state), **reproducible** (same source + lockfile → same warm snapshot), **isolated** (a run can't corrupt the host), and **drop-in** (existing commands run unchanged — no per-repo rewrite).

**Adoption is a goal, not an afterthought.** A repo moves commands onto the sandbox one at a time, behind a single `virrun -- <cmd>` prefix, with auto-fallback to native — so trying it costs one token and reverting costs one token. See [specs/adoption.md](specs/adoption.md).

## Gates (non-negotiable)

Two pass/fail gates on every backend and speed feature — a violation is not shippable, however clever: **faster than the native baseline**, and **observably correct** (exit code, stdout/stderr, produced files, dependency tree) vs running the command natively. Correctness beats speed; a fast wrong answer is worthless. Detail: [benchmarking](specs/benchmarking.md) · [correctness](specs/correctness.md).

## Now

Phase 3 — snapshot + warm-fork. The FS-only overlay snapshot has landed: `createSnapshot` captures a warm post-install state into a lockfile-hash-keyed layer in the host-global `~/.virrun`, a fork re-runs against it without reinstalling, and the cold-vs-warm bench gates the win. Open: a public `fork()` handle on the orchestrator. Phase 2's `os` backend (Bubblewrap RAM overlay, real `pnpm install`, shared `.virrun/store/pnpm`, Windows→WSL2 bridge) is done bar the macOS VM bridge → [roadmap.md](roadmap.md).

## Shipped

Terse log; the linked spec holds the detail.

- **Phase 0 — foundations**: `virrun` (public, unscoped) — the `ExecBackend` seam, native passthrough backend, async `createVirrun`, `dir`/`files`/`git` source loaders, the `virrun -- <cmd>` CLI, and the `pnpm bench` foundation (colocated per-file `*.bench.{json,md}`). → [orchestrator-api](specs/orchestrator-api.md) · [adoption](specs/adoption.md) · [benchmarking](specs/benchmarking.md)
- **`vfs` Step A — FS layer**: `FsProvider` + `createPlatformaticFsProvider` over `@platformatic/vfs` (the lone import, doubling as the `node:vfs` swap shim); mounting patches `require`/`fs` to serve virtual files; cross-platform. → [virtual-fs](specs/virtual-fs.md)
- **`vfs` Step B — in-process runner** (both gates passed): `BackendType.Vfs` runs `node -e`/`--eval` and `node <file>` in the current process over an overlay-mounted FS, falling back to native for anything it can't run faithfully. Opt-in only — no isolation yet, so `Auto` stays native. → [exec-isolation](specs/exec-isolation.md)
- **Phase 3 — FS-only overlay snapshot + fork**: lockfile-hash cache addressing (`~/.virrun/snapshots/<hash>`, `VIRRUN_CACHE_HOME` override), the `OverlayLayers` bwrap argv (stacked lowers for fork, persisted upper for capture), and `createSnapshot` capturing a warm post-install layer (Linux + WSL); a fork re-runs over it offline with writes vanishing. Capture→fork validated end-to-end. → [snapshot-fork](specs/snapshot-fork.md)

## Decisions

Grep [out-of-scope/](out-of-scope) and [deferred/](deferred) before adding a roadmap item.

- [out-of-scope/pure-js-exec.md](out-of-scope/pure-js-exec.md) — why a pure-JS interpreter (just-bash style) can't be the exec engine.
- [deferred/wasm-runtime.md](deferred/wasm-runtime.md) — WebContainers-style WASM-node backend, parked with a revisit trigger.
- [deferred/citty-cli.md](deferred/citty-cli.md) — delegate the CLI to unjs/citty once it grows real subcommands/flags.
- [deferred/ci-bench-gate.md](deferred/ci-bench-gate.md) — enforce the bench + differential suites as required CI gates once a backend can actually regress.
- [deferred/whole-repo-routing.md](deferred/whole-repo-routing.md) — why "route every command at once" waits for warm-fork; adopt one command at a time instead.

## Reference

- [architecture.md](architecture.md) — system overview diagram, layer map, the five layers, reuse-vs-build, the subprocess wall.
- [roadmap.md](roadmap.md) — phased, checkbox backlog.
- [specs/virtual-fs.md](specs/virtual-fs.md) — FS layer (reuse node:vfs/platformatic + one-line-swap plan).
- [specs/exec-isolation.md](specs/exec-isolation.md) — the core: real exec + isolation backends.
- [specs/snapshot-fork.md](specs/snapshot-fork.md) — warm snapshot + fork.
- [specs/orchestrator-api.md](specs/orchestrator-api.md) — the TS, node-compatible public API.
- [specs/adoption.md](specs/adoption.md) — incremental opt-in: prefix → script → config → shim, with auto-fallback; dogfooding ladder for this repo.
- [specs/config-and-cache.md](specs/config-and-cache.md) — the on-disk surface: `virrun.config.json` allowlist (committed) + `.virrun/` cache (gitignored).
- [specs/benchmarking.md](specs/benchmarking.md) — speed gate: baselines, metrics, methodology, must-beat-native rule.
- [specs/correctness.md](specs/correctness.md) — correctness gate: differential testing vs native, test layers, coverage.
- [reference/prior-art.md](reference/prior-art.md) — surveyed projects (node:vfs, platformatic, just-bash, WebContainers, e2b, Firecracker) and why each does/doesn't fit.
