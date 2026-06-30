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

Two pass/fail gates on every backend and speed feature — a violation is not shippable, however clever: **faster than the native baseline**, and **observably correct** (exit code, stdout/stderr, produced files, dependency tree) vs running the command natively. Correctness beats speed; a fast wrong answer is worthless. Both are now **CI-enforced**: differential correctness is a shared Vitest harness (a growing command corpus, an explicit `normalizeExecResult` masking seam with nothing normalized implicitly, and the `assertDifferential` helper both backends run their corpus through) that hard-fails the 🏗️ CI coverage shards on any divergence; speed is tracked by hardware-independent **CodSpeed simulation** (🏎️ Bench) plus the committed `*.bench.md` offline diff (a hard wall-clock CI fail is rejected as runner-noise-flaky → [out-of-scope/ci-walltime-gate.md](out-of-scope/ci-walltime-gate.md)). Detail: [benchmarking](specs/benchmarking.md) · [correctness](specs/correctness.md).

## Now

Write-back (Phase 5) has shipped, so the loop is closed: a `virrun -- <cmd>` run now reconciles the command's produced files back onto the host on a clean exit (the `os` backend's persist `ExecutionMode`, default for a bare prefix; `run --ephemeral` keeps the old vanishing fork, `exec` is the cold sibling), while `node_modules` — the snapshot lower — is never leaked. That unblocks mutating commands, and **this repo now dogfoods it**: the read-only `format:check`/`lint`/`typecheck`/`test` were already routed, and the mutating dev-loop siblings `format` (`virrun -- oxfmt`), `lint:fix`, and `lint:fix:packages` now carry the prefix too. An equivalence corpus (`persistRun.equivalence.test.ts`) gates it in the 🏗️ coverage shards, asserting every overlay-entry shape those commands produce reconciles like native (in-place edit, nested create, whiteout delete, the node_modules drop, all-or-nothing rollback). Still native by design: `build:packages` (the bootstrap that produces the `virrun` bin itself) and `coverage` (its tmpfs upper would discard the report); `build:app`/`build:docs` and `db:gen` await a heavier build/cross-package-output proof → [roadmap.md](roadmap.md) · [specs/write-back.md](specs/write-back.md).

What's left: Phase 2's macOS VM bridge, and Phase 4's Firecracker microVM backend + task cache. Adoption levels 0–3 are all live (prefix → script → committed `virrun.config.json` backend selection); there is no allowlist — the prefix **is** the per-command switch, with auto-fallback to native on a host without bubblewrap or WSL Linux Node, and a `VIRRUN=true` signal injected into every routed command's environment.

## Shipped

Terse log; the linked spec holds the detail.

- **Phase 0 — foundations**: `virrun` (public, unscoped) — the `ExecBackend` seam, native passthrough backend, async `createVirrun`, `dir`/`files`/`git` source loaders, the `virrun -- <cmd>` CLI, and the `pnpm bench` foundation (colocated per-file `*.bench.{json,md}`). → [orchestrator-api](specs/orchestrator-api.md) · [adoption](specs/adoption.md) · [benchmarking](specs/benchmarking.md)
- **`vfs` Step A — FS layer**: `FsProvider` + `createPlatformaticFsProvider` over `@platformatic/vfs` (the lone import, doubling as the `node:vfs` swap shim); mounting patches `require`/`fs` to serve virtual files; cross-platform. → [virtual-fs](specs/virtual-fs.md)
- **`vfs` Step B — in-process runner** (both gates passed): `BackendType.Vfs` runs `node -e`/`--eval` and `node <file>` in the current process over an overlay-mounted FS, falling back to native for anything it can't run faithfully. Opt-in only — no isolation yet, so `Auto` stays native. → [exec-isolation](specs/exec-isolation.md)
- **Phase 2 — `os` backend (native core, Linux + WSL)**: real process exec inside a rootless `bubblewrap` RAM-overlay (source RO lower + tmpfs RW upper, one unprivileged tool), proven by a full monorepo `pnpm install` + a native binary (esbuild) running entirely in RAM with the host disk untouched; plus a lazy content-addressable pnpm dep store (`.virrun/store/pnpm`, bind-mounted + reused) and a WSL2 bridge reaching the backend from Windows hosts. macOS VM bridge still open. → [exec-isolation](specs/exec-isolation.md)
- **Phase 3 — FS-only overlay snapshot + fork**: lockfile-hash cache addressing (`~/.virrun/snapshots/<hash>`, `VIRRUN_CACHE_HOME` override), the `OverlayLayers` bwrap argv (stacked lowers for fork, persisted upper for capture), `createSnapshot` capturing a warm post-install layer + `forkSnapshot` re-running over it offline with writes vanishing, and a transparent `fork()` on the `createVirrun` handle (os captures-or-reuses; other backends fall through to `exec`). Capture→fork validated end-to-end; cold-vs-warm bench gates the win; capture publishes atomically (per-pid temp + `rename`) so a concurrent fork never reads a half-built layer. → [snapshot-fork](specs/snapshot-fork.md)
- **Phase 4 — config backend selection (adoption level 3)**: a committed repo-root `virrun.config.json` (`backend`/`fallback`) pins which backend a sandboxed command runs through — no allowlist; the `virrun -- <cmd>` prefix is the sole per-command switch. `resolveVirrunConfiguration` walks up via `empathic` (standard parent-dir search, JSON config), `parseVirrunConfiguration` validates + defaults, and the CLI's `resolveBackend` picks the backend with host-support auto-fallback. Absent config = auto (native today). → [config-and-cache](specs/config-and-cache.md) · [adoption](specs/adoption.md)
- **Phase 4 — citty CLI**: the hand-rolled `argv` parsing is replaced by [unjs/citty](https://github.com/unjs/citty) for declarative subcommands, flags, and generated `--help`. The bare `virrun -- <cmd>` prefix is preserved as citty's default subcommand (`run`), so CI/scripts/dogfooding stay byte-for-byte unchanged; on top of it sit `run`/`exec` (smart fork vs forced plain exec), `snapshot` (warm the lockfile's `os` snapshot ahead of time), `init` (write `virrun.config.json --backend`), and `cache ls`/`cache clean [--all]`. The old `parseCliCommand` split is gone — the command argv is citty's positional rest (`args._`). → [getting-started](https://github.com/Esposter/Esposter/blob/main/packages/virrun/readme/getting-started.md#subcommands)
- **Phase 4 — CI snapshot cache**: the warm `os`-backend snapshot is captured once per 🏗️ CI run by a reusable `warm-snapshot.yaml` job and persisted as a lockfile-hash-keyed `actions/cache` entry (`~/.virrun/snapshots`, mirroring the `build-packages` content-hash cache); the format/lint/typecheck jobs restore it read-only and `fork()` the warm dep tree instead of each cold-installing — one install per run, reused across runs. Those jobs also drop the host `pnpm i` (`setup-packages install: false`, virrun bin exposed from the artifact), since the fork supplies node_modules. → [virrun CI](https://github.com/Esposter/Esposter/blob/main/packages/virrun/readme/ci.md#snapshot-cache) · [snapshot-fork](specs/snapshot-fork.md)
- **Phase 5 — write-back (native-equivalent persistence)**: a persist run forks the warm snapshot with a _persistable_ upper and, on a clean exit only (all-or-nothing), reconciles that upper onto the host so disk matches a native run — yet never flushes `node_modules` (the snapshot lower) or writes into it. `parseOverlayEntryKind` + `buildFlushPlan` classify and order each upper entry (regular copy-up vs char-dev whiteout vs opaque dir) in pure, unit-tested TS, skipping any path the snapshot lower supplies (including descendants); a python3 probe/apply pair (`runOverlayScript`, direct on Linux / via `wsl.exe` on Windows) reads the manifest and applies the plan Linux-side. The CLI's persist `ExecutionMode` is the default for a bare `virrun -- <cmd>`; `run --ephemeral` keeps the vanishing fork and `exec` is the cold sibling. This repo dogfoods it on the mutating dev-loop scripts (`format`, `lint:fix`, `lint:fix:packages`); a coverage-shard equivalence corpus asserts every flush shape (edit/create/nested/whiteout/node_modules-drop/rollback) matches native. → [write-back](specs/write-back.md)

## Decisions

Grep [out-of-scope/](out-of-scope) and [deferred/](deferred) before adding a roadmap item.

- [out-of-scope/pure-js-exec.md](out-of-scope/pure-js-exec.md) — why a pure-JS interpreter (just-bash style) can't be the exec engine.
- [out-of-scope/ci-walltime-gate.md](out-of-scope/ci-walltime-gate.md) — why a hard wall-clock benchmark CI fail is rejected (runner noise); CodSpeed simulation + the Vitest differential suite cover it instead.
- [deferred/wasm-runtime.md](deferred/wasm-runtime.md) — WebContainers-style WASM-node backend, parked with a revisit trigger.
- [deferred/whole-repo-routing.md](deferred/whole-repo-routing.md) — why "route every command at once" stays deferred (`Auto` still resolves to native; needs a viable spawn-interceptor seam, the PATH shim being dropped); adopt one command at a time instead.
- [deferred/materialize-node-modules.md](deferred/materialize-node-modules.md) — why write-back doesn't flush `node_modules` to host disk (snapshot lower stays RO); revisit only if an editor flow proves it needs on-disk deps.

## Reference

- [architecture.md](architecture.md) — system overview diagram, layer map, the five layers, reuse-vs-build, the subprocess wall.
- [roadmap.md](roadmap.md) — phased, checkbox backlog.
- [specs/virtual-fs.md](specs/virtual-fs.md) — FS layer (reuse node:vfs/platformatic + one-line-swap plan).
- [specs/exec-isolation.md](specs/exec-isolation.md) — the core: real exec + isolation backends.
- [specs/snapshot-fork.md](specs/snapshot-fork.md) — warm snapshot + fork.
- [specs/write-back.md](specs/write-back.md) — native-equivalent persistence: flush a mutation command's produced files back to host.
- [specs/orchestrator-api.md](specs/orchestrator-api.md) — the TS, node-compatible public API.
- [specs/adoption.md](specs/adoption.md) — incremental opt-in: prefix → script → config (backend selection), with auto-fallback; dogfooding ladder for this repo.
- [specs/config-and-cache.md](specs/config-and-cache.md) — the on-disk surface: `virrun.config.json` backend selection (committed) + `.virrun/` cache (gitignored).
- [specs/benchmarking.md](specs/benchmarking.md) — speed gate: baselines, metrics, methodology, must-beat-native rule.
- [specs/correctness.md](specs/correctness.md) — correctness gate: differential testing vs native, test layers, coverage.
- [reference/prior-art.md](reference/prior-art.md) — surveyed projects (node:vfs, platformatic, just-bash, WebContainers, e2b, Firecracker) and why each does/doesn't fit.
