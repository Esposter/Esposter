# sandbox-runtime — Roadmap

Phased, prioritized backlog. Early phases ship something usable with pure npm; later phases add the OS-level native core and distribution. Grep [out-of-scope/](out-of-scope) + [deferred/](deferred) before adding items. Sweep finished features to README `## Shipped`.

## Gates (continuous — every phase)

These run from the first backend onward, not as a phase. A change that fails either does not ship.

- [ ] **Speed harness** — native-baseline benchmark over a fixed repo corpus, cache-state matrix → [specs/benchmarking.md](specs/benchmarking.md). Any path slower than baseline gets cut. CI-enforcement is deferred until a backend can actually regress → [deferred/ci-bench-gate.md](deferred/ci-bench-gate.md).
- [ ] **Differential correctness suite** — run each command natively vs sandbox, normalize, assert identical → [specs/correctness.md](specs/correctness.md). Grow the corpus on every gap; every fixed bug becomes a golden regression test. CI-enforcement deferred with the speed gate → [deferred/ci-bench-gate.md](deferred/ci-bench-gate.md).

Phase 0 (foundations) and Phase 1 (the `vfs` backend — FS layer + in-process `node -e`/`node <file>` runner, both gates passed) are shipped; see README `## Shipped` and the linked specs. Open work below.

## Phase 2 — `os` backend (the native core, Linux)

- [x] RAM filesystem: supplied by `bubblewrap --overlay-src` (lowerdir = source RO) + `--tmp-overlay` (upperdir = tmpfs RW) in one unprivileged tool — no manual `tmpfs`/`overlayfs` root mounts → [specs/exec-isolation.md](specs/exec-isolation.md).
- [x] Real process exec inside an isolation primitive — `bubblewrap` chosen (rootless; collapses overlay + tmpfs + namespaces into one tool); `nsjail` / rootless `runc` / Firecracker stay deferred. Step A wraps any command in the bwrap RAM-overlay, reusing the native spawn/capture plumbing.
- [x] Verify the wall is broken (Step B): a real `pnpm install` of this monorepo's full dependency closure (manifest-mirror corpus) + a native binary (esbuild) runs fully in RAM, isolated — host disk untouched → [specs/exec-isolation.md](specs/exec-isolation.md). Honest baseline measured: cold install in the sandbox is ~2× slower than native (bwrap setup + the on-disk store can't be hardlinked into the RAM overlay, so it copies). The speed win is therefore deferred to warm-fork (Phase 3), not cold install.
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
