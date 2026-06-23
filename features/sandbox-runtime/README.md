# sandbox-runtime

An ephemeral, in-memory sandbox runtime: boot any repo into a RAM-backed filesystem, run its **real toolchain** (pnpm/npm, native addons, scripts) fast and isolated, then **snapshot and fork** the warm state so repeated runs are near-instant.

Standalone OSS project (eventually its own repo / `packages/sandbox-runtime*`); design docs incubate here. This README is the index.

## What it is — and is not

- **Not a VFS.** The virtual filesystem is a _reused_ layer (`node:vfs` / `@platformatic/vfs`), not the product.
- **It is a runtime.** The product is the layer that **runs real processes** against that FS, isolates them, and snapshots/forks them. node:vfs _stores_ files; this _runs_ the toolchain over them.

## Design goals

The point is **developer experience through speed** — make the everyday toolchain (install, build, test, lint) dramatically faster by removing the two things that make it slow:

- **Network-bound waits** — deps are fetched once into a shared store and reused; a warm snapshot skips install entirely. Re-runs don't re-download.
- **Disk I/O** — files live in a RAM filesystem; `node_modules` and build output never touch real disk.

Plus: **ephemeral** (spin up / throw away, no polluted machine state), **reproducible** (same source + lockfile → same warm snapshot), **isolated** (a run can't corrupt the host), and **drop-in** (existing commands run unchanged — no per-repo rewrite).

**Adoption is a goal, not an afterthought.** A repo moves commands onto the sandbox one at a time, behind a single `sandbox -- <cmd>` prefix, with auto-fallback to native — so trying it costs one token and reverting costs one token. See [specs/adoption.md](specs/adoption.md).

## Non-negotiables (the gates)

These are pass/fail. A feature that violates either is not shippable, no matter how clever.

1. **Faster than baseline.** If a path is slower than just running the command normally, it has negative value — delete it. Every backend and every speed feature is gated on benchmarks vs native. See [specs/benchmarking.md](specs/benchmarking.md).
2. **Correct.** Observable results (exit code, stdout/stderr, produced files, dependency tree) must match running the command natively. Correctness beats speed every time; a fast wrong answer is worthless. This demands an extensive test suite. See [specs/correctness.md](specs/correctness.md).

## Now

- MVP foundation shipped: `@esposter/sandbox-runtime` (private) with the `ExecBackend` seam, a native passthrough backend, async `createSandbox`, source loaders (`dir`/`files`/`git` → working dir + `dispose`), the `sandbox -- <cmd>` CLI, and the benchmark foundation (`pnpm bench` → committed [results.md](../../packages/sandbox-runtime/bench/results.md) with env metadata + tinybench stats). CI-enforcement of the gates is deferred until a backend can regress.
- `vfs` backend Phase 1 **Step A** shipped: the RAM-backed FS layer — `FsProvider` interface + `createPlatformaticFsProvider` adapter over `@platformatic/vfs` (the lone import, doubling as the `node:vfs` swap shim). Mounting patches `require`/`fs` so in-process code reads virtual files; verified cross-platform (Windows + node 26). Next up in [roadmap.md](roadmap.md): **Step B** — the in-process `vfs` exec backend.
- Core open question that still gates the real speedup: making **spawned subprocesses and native binaries** see the RAM filesystem (node:vfs is in-process JS only). See [architecture.md](architecture.md) → "The subprocess wall".

## Decisions

Grep [out-of-scope/](out-of-scope) and [deferred/](deferred) before adding a roadmap item.

- [out-of-scope/pure-js-exec.md](out-of-scope/pure-js-exec.md) — why a pure-JS interpreter (just-bash style) can't be the exec engine.
- [deferred/wasm-runtime.md](deferred/wasm-runtime.md) — WebContainers-style WASM-node backend, parked with a revisit trigger.
- [deferred/citty-cli.md](deferred/citty-cli.md) — delegate the CLI to unjs/citty once it grows real subcommands/flags.
- [deferred/ci-bench-gate.md](deferred/ci-bench-gate.md) — enforce the bench + differential suites as required CI gates once a backend can actually regress.

## Reference

- [architecture.md](architecture.md) — layer map, the five layers, reuse-vs-build, the subprocess wall.
- [roadmap.md](roadmap.md) — phased, checkbox backlog.
- [specs/virtual-fs.md](specs/virtual-fs.md) — FS layer (reuse node:vfs/platformatic + one-line-swap plan).
- [specs/exec-isolation.md](specs/exec-isolation.md) — the core: real exec + isolation backends.
- [specs/snapshot-fork.md](specs/snapshot-fork.md) — warm snapshot + fork.
- [specs/orchestrator-api.md](specs/orchestrator-api.md) — the TS, node-compatible public API.
- [specs/adoption.md](specs/adoption.md) — incremental opt-in: prefix → script → config → shim, with auto-fallback; dogfooding ladder for this repo.
- [specs/benchmarking.md](specs/benchmarking.md) — speed gate: baselines, metrics, methodology, must-beat-native rule.
- [specs/correctness.md](specs/correctness.md) — correctness gate: differential testing vs native, test layers, coverage.
- [reference/prior-art.md](reference/prior-art.md) — surveyed projects (node:vfs, platformatic, just-bash, WebContainers, e2b, Firecracker) and why each does/doesn't fit.
