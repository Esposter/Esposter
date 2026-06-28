# virrun — Roadmap

Phased, prioritized backlog. Early phases ship something usable with pure npm; later phases add the OS-level native core and distribution. Grep [out-of-scope/](out-of-scope) + [deferred/](deferred) before adding items. Sweep finished features to README `## Shipped`.

## Gates (continuous — every phase)

These run from the first backend onward, not as a phase. A change that fails either does not ship.

- [ ] **Speed harness** — native-baseline benchmark over a fixed repo corpus, cache-state matrix → [specs/benchmarking.md](specs/benchmarking.md). Any path slower than baseline gets cut. CI-enforcement is deferred until a backend can actually regress → [deferred/ci-bench-gate.md](deferred/ci-bench-gate.md).
- [ ] **Differential correctness suite** — run each command natively vs sandbox, normalize, assert identical → [specs/correctness.md](specs/correctness.md). Grow the corpus on every gap; every fixed bug becomes a golden regression test. CI-enforcement deferred with the speed gate → [deferred/ci-bench-gate.md](deferred/ci-bench-gate.md).

Phase 0 (foundations) and Phase 1 (the `vfs` backend — FS layer + in-process `node -e`/`node <file>` runner, both gates passed) are shipped; see README `## Shipped` and the linked specs. Open work below.

## Phase 2 — `os` backend (the native core, Linux)

- [x] RAM filesystem: supplied by `bubblewrap --overlay-src` (lowerdir = source RO) + `--tmp-overlay` (upperdir = tmpfs RW) in one unprivileged tool — no manual `tmpfs`/`overlayfs` root mounts → [specs/exec-isolation.md](specs/exec-isolation.md).
- [x] Real process exec inside an isolation primitive — `bubblewrap` chosen (rootless; collapses overlay + tmpfs + namespaces into one tool); `nsjail` / rootless `runc` / Firecracker stay deferred. Step A wraps any command in the bwrap RAM-overlay, reusing the native spawn/capture plumbing.
- [x] Verify the wall is broken (Step B): a real `pnpm install` of this monorepo's full dependency closure (manifest-mirror corpus) + a native binary (esbuild) runs fully in RAM, isolated — host disk untouched → [specs/exec-isolation.md](specs/exec-isolation.md). Speed measured against the native baseline over the real workspace corpus (install / typecheck / build / test); see `src/localMonorepo.bench.md`.
- [x] Shared content-addressable dep store: `.virrun/store/pnpm` is created lazily, gitignored, bind-mounted writable into the `os` sandbox, and exposed to pnpm via env so downloads are reused. Package imports use copy for now because hardlinks cannot cross from the on-disk store into the RAM overlay.
- [x] WSL2 bridge so the backend is reachable from Windows hosts (`wsl.exe` + `wslpath`, same bwrap argv, Windows cwd/store paths translated before entering Linux).
- [ ] macOS bridge through a lightweight Linux VM.

## Phase 3 — Snapshot + warm-fork

- [x] Snapshot warm state post-install — FS-only overlay-layer snapshot: `createSnapshot` runs a setup command in capture mode (`bwrap --overlay <upper> <work> <dir>`) so post-install writes persist into the snapshot upper (Linux + WSL). CRIU/microVM stay deferred → [specs/snapshot-fork.md](specs/snapshot-fork.md).
- [x] `fork()` a snapshot into an isolated run — `forkSnapshot` stacks the captured upper read-only over the source with a fresh tmpfs upper (capture→fork validated end-to-end). `createSnapshot` + `forkSnapshot` are the programmatic pair; a cold-vs-warm bench (`localMonorepo.bench.ts` → "install - warm fork vs cold reinstall") measures the win on native Linux. The `createVirrun` handle now exposes a transparent `fork(command)`: os backend captures-or-reuses the snapshot keyed by lockfile hash; other backends fall through to `exec`. Still deferred: always-on whole-repo routing (a single switch / PATH shim that forks everything), which waits on the config allowlist → [deferred/whole-repo-routing.md](deferred/whole-repo-routing.md).
- [x] Snapshot cache keyed by lockfile hash — `~/.virrun/snapshots/<sha256(pnpm-lock.yaml)>` (host-global, `VIRRUN_CACHE_HOME` override), so a dependency change invalidates exactly that entry and the same deps reuse one warm snapshot across repos/CI.

## Phase 4 — Distribution & CI

- [ ] Migrate the CLI to [unjs/citty](https://github.com/unjs/citty) for declarative subcommands/flags/`--help`, then add `virrun run`, `virrun exec`, `virrun snapshot`, `virrun init`, `virrun cache` (ls/clean) — extends the Phase 0 prefix CLI → [deferred/citty-cli.md](deferred/citty-cli.md).
- [ ] Config allowlist + local cache → [specs/config-and-cache.md](specs/config-and-cache.md). Higher adoption levels (3–4), once the prefix is trusted.
  - [ ] Read `virrun.config.json` (route/backend/fallback) from repo root; absent = no-op to native.
  - [ ] Route a command iff its leading tokens match `route`; gate-enforced auto-fallback to `fallback`.
  - [ ] Materialize `.virrun/` (`store/`, `snapshots/`) lazily; add `/.virrun/` to the consuming repo's `.gitignore` on first write.
  - [ ] Opt-in PATH shim behind an env flag (`VIRRUN=1`) intercepting known binaries per the allowlist.
  - [ ] Whole-repo / always-on routing stays out until warm-fork lands → [deferred/whole-repo-routing.md](deferred/whole-repo-routing.md).
- [ ] Firecracker microVM backend for untrusted multi-tenant / CI fan-out.
- [ ] Task cache (skip unchanged builds) — evaluate reusing Turborepo cache vs native.
- [ ] CI recipe: ephemeral sandbox per PR from a warm snapshot.
