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

Phase 4 — distribution & CI. Adoption level 3 (committed backend selection) has landed and **this repo now dogfoods it**: a committed repo-root `virrun.config.json` pins the `os` backend, and the package ships a `schema.json` so the config gets editor autocompletion/validation via `$schema` (oxlint-style). The CLI resolves the config (walking up via `empathic`) and picks the backend with auto-fallback to the configured `fallback` backend (typically native) on an unsupported host — so on a host without bubblewrap or Linux Node.js in WSL (e.g. Windows without WSL or without Linux Node set up) every command transparently runs native. **There is no allowlist** — the `virrun -- <cmd>` prefix **is** the per-command switch (add it to adopt, remove it to drop); the config only selects _which_ backend a sandboxed command runs through. virrun injects a vitest-style `VIRRUN=true` signal into every command's environment (read via `isVirrunEnabled`), so a test/config/tool can detect it runs under virrun — an output it sets, not an input that gates. The originally-planned transparent PATH shim (level 4) is measured-unviable for pnpm-local tools (pnpm prepends `.bin` ahead of any inherited shim dir) and dropped; since transparent no-prefix routing was the only thing an allowlist was for, the allowlist went with it. The CLI is now [unjs/citty](https://github.com/unjs/citty)-based — declarative subcommands (`run`/`exec`/`snapshot`/`init`/`cache`), flags, and `--help`, with the bare `virrun -- <cmd>` prefix preserved as the default `run` subcommand. Phase 3 (snapshot + warm-fork, incl. the transparent `fork()` handle on the orchestrator — its capture publishes atomically via a private temp + `rename`, so a concurrent fork never reads a half-built snapshot) and Phase 2's `os` backend are done bar the macOS VM bridge → [roadmap.md](roadmap.md).

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

## Decisions

Grep [out-of-scope/](out-of-scope) and [deferred/](deferred) before adding a roadmap item.

- [out-of-scope/pure-js-exec.md](out-of-scope/pure-js-exec.md) — why a pure-JS interpreter (just-bash style) can't be the exec engine.
- [out-of-scope/ci-walltime-gate.md](out-of-scope/ci-walltime-gate.md) — why a hard wall-clock benchmark CI fail is rejected (runner noise); CodSpeed simulation + the Vitest differential suite cover it instead.
- [deferred/wasm-runtime.md](deferred/wasm-runtime.md) — WebContainers-style WASM-node backend, parked with a revisit trigger.
- [deferred/whole-repo-routing.md](deferred/whole-repo-routing.md) — why "route every command at once" stays deferred (`Auto` still resolves to native; needs a viable spawn-interceptor seam, the PATH shim being dropped); adopt one command at a time instead.

## Reference

- [architecture.md](architecture.md) — system overview diagram, layer map, the five layers, reuse-vs-build, the subprocess wall.
- [roadmap.md](roadmap.md) — phased, checkbox backlog.
- [specs/virtual-fs.md](specs/virtual-fs.md) — FS layer (reuse node:vfs/platformatic + one-line-swap plan).
- [specs/exec-isolation.md](specs/exec-isolation.md) — the core: real exec + isolation backends.
- [specs/snapshot-fork.md](specs/snapshot-fork.md) — warm snapshot + fork.
- [specs/orchestrator-api.md](specs/orchestrator-api.md) — the TS, node-compatible public API.
- [specs/adoption.md](specs/adoption.md) — incremental opt-in: prefix → script → config (backend selection), with auto-fallback; dogfooding ladder for this repo.
- [specs/config-and-cache.md](specs/config-and-cache.md) — the on-disk surface: `virrun.config.json` backend selection (committed) + `.virrun/` cache (gitignored).
- [specs/benchmarking.md](specs/benchmarking.md) — speed gate: baselines, metrics, methodology, must-beat-native rule.
- [specs/correctness.md](specs/correctness.md) — correctness gate: differential testing vs native, test layers, coverage.
- [reference/prior-art.md](reference/prior-art.md) — surveyed projects (node:vfs, platformatic, just-bash, WebContainers, e2b, Firecracker) and why each does/doesn't fit.
