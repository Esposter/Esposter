# sandbox-runtime — Roadmap

Phased, prioritized backlog. Early phases ship something usable with pure npm; later phases add the OS-level native core and distribution. Grep [out-of-scope/](out-of-scope) + [deferred/](deferred) before adding items. Sweep finished features to README `## Shipped`.

## Gates (continuous — every phase)

These run from the first backend onward, not as a phase. A change that fails either does not ship.

- [ ] **Speed harness** — native-baseline benchmark over a fixed repo corpus, cache-state matrix → [specs/benchmarking.md](specs/benchmarking.md). Any path slower than baseline gets cut. CI-enforcement is deferred until a backend can actually regress → [deferred/ci-bench-gate.md](deferred/ci-bench-gate.md).
- [ ] **Differential correctness suite** — run each command natively vs sandbox, normalize, assert identical → [specs/correctness.md](specs/correctness.md). Grow the corpus on every gap; every fixed bug becomes a golden regression test. CI-enforcement deferred with the speed gate → [deferred/ci-bench-gate.md](deferred/ci-bench-gate.md).

## Phase 0 — Foundations

- [x] Lock package layout following monorepo convention: `@esposter/sandbox-runtime` (private for now). Sibling `-vfs`/`-os` packages split out when those backends land.
- [x] Define the public API surface → `createSandbox` / `Sandbox.exec` / `ExecBackend` / `BackendType`, see [specs/orchestrator-api.md](specs/orchestrator-api.md).
- [x] `ExecBackend` seam + native passthrough backend — the foundation every future backend implements.
- [x] `sandbox -- <command>` prefix CLI with live stdio + exit-code propagation → [specs/adoption.md](specs/adoption.md). Routes through the sandbox; native passthrough today, so it is already dogfoodable on this repo.
- [x] Stand up the benchmark + correctness harnesses against the native backend (differential test asserts identical-to-native; `pnpm bench` reports sandbox-vs-baseline) so every later phase is measured from day one.
- [x] Source loaders: `{ dir }`, `{ files }`, `{ git }` (discriminated on `SourceType`) → normalized into a `LoadedSource` (working dir + `dispose`); `createSandbox` is now async and owns teardown.
- [x] Benchmark foundation — `pnpm bench` writes committed colocated per-file `*.bench.json` + `*.bench.md` (environment + commit metadata + tinybench stats: mean/±rme/p99/samples + a `vs base` multiplier). Regenerate + diff pre-commit as a manual regression check. CI-enforcement deferred → [deferred/ci-bench-gate.md](deferred/ci-bench-gate.md).

## Phase 1 — `vfs` backend (pure npm, cross-platform)

### Step A — FS layer (shipped)

- [x] Wrap `@platformatic/vfs` behind our `FsProvider` interface; the single adapter import doubles as the `node:vfs` swap shim → [specs/virtual-fs.md](specs/virtual-fs.md).
- [x] Tests (cross-platform, incl. Windows + node 26): in-memory read/write/exists/mkdir; mount → global `require`/`fs` serve virtual files; dispose tears down. Contract: mount the prefix first, then read/write prefixed paths.

### Step B1 — in-process runner (shipped; both gates passed)

- [x] `BackendType.Vfs` + in-process runner for `node -e`/`--eval`: a shell-aware tokenizer parses the invocation (native fallback on shell operators / other flags / file runs); inline code runs via `vm.runInThisContext` with patched global process streams + exit and an injected `require`, capturing stdout/stderr/exit-code. Falls back to native for anything not run faithfully in-process (syntax error, async result, uncaught error, unrecognised command). Wired into `backendFactories`. Opt-in only — it has no isolation, so `Auto` still resolves to Native.
- [x] **Correctness gate** — `createVfsBackend.differential.test.ts`: a `node -e` corpus (stdout/stderr writes, `process.exit(n)`, `require`, empty code, uncaught throw) plus fall-through commands (`node -p`, `node --version`) run native vs vfs → identical `ExecResult`. → [specs/correctness.md](specs/correctness.md)
- [x] **Speed gate** — `createVfsBackend.bench.ts` (colocated [createVfsBackend.bench.md](../../packages/sandbox-runtime/src/services/exec/createVfsBackend.bench.md)): in-process `node -e` runs orders of magnitude faster than native spawn (the node-startup cost removed); the fall-back path ties native within noise (parse-and-delegate adds ~0). Absolute timings are machine-dependent and never pinned here — the regression check is regenerating + diffing that md, where each task's `vs base` multiplier (native = `1.00×`) makes a regression obvious. → [specs/benchmarking.md](specs/benchmarking.md)

### Step B2 — FS integration + correctness (shipped; both gates passed)

- [x] Mount an overlay `FsProvider` at the working dir around every in-process run so the vfs module hooks + core fs serve virtual files and fall through to real disk otherwise; add `node <file>` execution (a lone non-flag path, no script args yet) loading modules through the mount, with the require cache cleared back to its pre-run state so each run re-executes like a fresh process.
- [x] **Correctness gate** — extended `createVfsBackend.differential.test.ts` with a multi-file `node <file>` workload (entry requires a second module from real disk) run native vs vfs under the overlay → identical `ExecResult`, proving overlay fall-through; `createPlatformaticFsProvider.test.ts` adds a direct overlay read fall-through + virtual-shadow test. → [specs/correctness.md](specs/correctness.md)
- [x] **Speed gate** — `createVfsBackend.bench.ts` adds a `node <file>` hot-path task: in-process file runs stay orders of magnitude faster than native spawn even with the overlay mount; the `node -e` and fall-back tasks remain ahead. → [specs/benchmarking.md](specs/benchmarking.md)

## Phase 2 — `os` backend (the native core, Linux)

- [ ] RAM filesystem: `tmpfs` + `overlayfs` (lowerdir = source RO, upperdir = tmpfs RW) → [specs/exec-isolation.md](specs/exec-isolation.md).
- [ ] Real process exec inside an isolation primitive (`bubblewrap` first; evaluate `nsjail` / rootless `runc`).
- [ ] Verify the wall is broken: `pnpm install` + a native postinstall (sharp/esbuild) runs fully in RAM, isolated.
- [ ] Shared content-addressable dep store, hardlinked across sandboxes.
- [ ] WSL2 bridge so the backend is reachable from Windows/macOS hosts.

## Phase 3 — Snapshot + warm-fork

- [ ] Snapshot warm state post-install (CRIU for process+fs, or microVM/overlay-layer snapshot) → [specs/snapshot-fork.md](specs/snapshot-fork.md).
- [ ] `fork()` a snapshot into an isolated run; measure cold-vs-warm run time.
- [ ] Snapshot cache keyed by lockfile hash.

## Phase 4 — Distribution & CI

- [ ] CLI (`sandbox run`, `sandbox exec`, `sandbox snapshot`) — extends the Phase 0 prefix CLI.
- [ ] Config allowlist (`sandbox.config.json`) + opt-in PATH shim → [specs/adoption.md](specs/adoption.md). Higher adoption levels, once the prefix is trusted.
- [ ] Firecracker microVM backend for untrusted multi-tenant / CI fan-out.
- [ ] Task cache (skip unchanged builds) — evaluate reusing Turborepo cache vs native.
- [ ] CI recipe: ephemeral sandbox per PR from a warm snapshot.
