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
- [x] Benchmark foundation — `pnpm bench` writes a committed `bench/results.md` (environment metadata + tinybench latency stats: mean/sd/p99/samples + native-vs-sandbox ratio). Regenerate + diff pre-commit as a manual regression check. CI-enforcement deferred → [deferred/ci-bench-gate.md](deferred/ci-bench-gate.md).

## Phase 1 — `vfs` backend (pure npm, cross-platform)

### Step A — FS layer (shipped)

- [x] Wrap `@platformatic/vfs` behind our `FsProvider` interface; the single adapter import doubles as the `node:vfs` swap shim → [specs/virtual-fs.md](specs/virtual-fs.md).
- [x] Tests (cross-platform, incl. Windows + node 26): in-memory read/write/exists/mkdir; mount → global `require`/`fs` serve virtual files; dispose tears down. Contract: mount the prefix first, then read/write prefixed paths.

### Step B1 — in-process runner (implemented; pending the gates)

- [x] `BackendType.Vfs` + in-process runner for `node -e`/`--eval`: a shell-aware tokenizer parses the invocation (native fallback on shell operators / other flags / file runs); inline code runs via `vm.runInThisContext` with patched global process streams + exit and an injected `require`, capturing stdout/stderr/exit-code. Falls back to native for anything not run faithfully in-process (syntax error, async result, unrecognised command). Wired into `backendFactories`.
- [ ] **Gate it before calling it shipped** (this is where the continuous gates first bite — a backend can now regress):
  - [ ] Differential test: same command run native vs vfs → identical `ExecResult` (exit/stdout/stderr) across a `node -e` corpus, incl. fall-through commands. → [specs/correctness.md](specs/correctness.md)
  - [ ] Bench vfs in-process `node -e` vs native spawn (the hot path), plus a fall-back command (assert vfs ≈ native, ~0 overhead) and a native-baseline sanity pass; record in [bench/results.md](../../packages/sandbox-runtime/bench/results.md). Any path not faster than native gets cut. → [specs/benchmarking.md](specs/benchmarking.md)

### Step B2 — FS integration + correctness (next)

- [ ] Mount the `FsProvider` (overlay) around the in-process run so the vfs module hooks + fs interception apply; add `node <file>` execution loading modules from the vfs.
- [ ] Overlay fall-through to real disk + differential tests vs native for a pure-JS workload.

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
