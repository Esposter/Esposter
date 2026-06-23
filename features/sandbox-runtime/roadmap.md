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

- [ ] Wrap `@platformatic/vfs` as the FS layer behind our interface → [specs/virtual-fs.md](specs/virtual-fs.md).
- [ ] In-process exec for pure-JS workloads (run a JS entry / script against the virtual FS + module loader).
- [ ] `node:vfs` swap shim — single import indirection so we flip when core lands.
- [ ] Tests: read/write/overlay, module loading from virtual files, fall-through to real disk.

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
