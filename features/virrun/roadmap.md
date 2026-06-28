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
- [x] `fork()` a snapshot into an isolated run — `forkSnapshot` stacks the captured upper read-only over the source with a fresh tmpfs upper (capture→fork validated end-to-end). `createSnapshot` + `forkSnapshot` are the programmatic pair; a cold-vs-warm bench (`localMonorepo.bench.ts` → "install - warm fork vs cold reinstall") measures the win on native Linux. The `createVirrun` handle now exposes a transparent `fork(command)`: os backend captures-or-reuses the snapshot keyed by lockfile hash; other backends fall through to `exec`. Still deferred: always-on whole-repo routing (a single switch / PATH shim that forks everything) — the PATH shim is measured unviable for pnpm-local tools, so this now waits on `Auto` beating the gates plus a viable spawn-interceptor seam → [deferred/whole-repo-routing.md](deferred/whole-repo-routing.md).
- [x] Snapshot cache keyed by lockfile hash — `~/.virrun/snapshots/<sha256(pnpm-lock.yaml)>` (host-global, `VIRRUN_CACHE_HOME` override), so a dependency change invalidates exactly that entry and the same deps reuse one warm snapshot across repos/CI.

## Phase 4 — Distribution & CI

- [ ] Migrate the CLI to [unjs/citty](https://github.com/unjs/citty) for declarative subcommands/flags/`--help`, then add `virrun run`, `virrun exec`, `virrun snapshot`, `virrun init`, `virrun cache` (ls/clean) — extends the Phase 0 prefix CLI → [deferred/citty-cli.md](deferred/citty-cli.md).
- [~] Config backend selection + local cache → [specs/config-and-cache.md](specs/config-and-cache.md). Higher adoption levels (3–4), once the prefix is trusted. Level 3 (committed backend selection) landed; the level-4 shim was measured unviable and dropped.
  - [x] Read `virrun.config.json` (backend/fallback) from repo root; absent = backend defaults to auto (native today). Resolution walks up via `empathic` (standard parent-dir search, JSON config); `parseVirrunConfiguration` validates and defaults (`resolveVirrunConfiguration`). All fields optional in the file; ships a `schema.json` (`$schema`, oxlint-style) for editor types. This repo now commits a starter config pinning the `os` backend, with the prefix added on the read-only verification commands (`eslint .`, `oxfmt --check`, `tsgo`, `vitest run`) — dogfooding begun.
  - [x] No allowlist — the `virrun -- <cmd>` prefix is the sole per-command switch. The CLI picks the backend via `resolveBackend` and auto-falls-back to `fallback` when the chosen backend is unsupported on the host (e.g. `os` without bubblewrap). Benchmark-gate and differential-correctness fallbacks remain future work.
  - [x] Materialize `.virrun/` (`store/`, `snapshots/`) lazily; add `/.virrun/` to the consuming repo's `.gitignore` on first write. (Shipped with the Phase 2 dep store / Phase 3 snapshots.)
  - [x] No on/off input flag — the `virrun -- ` prefix is the per-command switch (add/remove to adopt/drop), so there is nothing global to toggle. virrun instead injects a vitest-style `VIRRUN=true` **output** signal into every command's environment (`isVirrunEnabled` reads it), so a test/config/tool can detect it runs under virrun. This replaces the originally-planned env-flag gate.
  - [ ] ~~PATH shim intercepting known binaries~~ — **measured unviable for pnpm-local tools and dropped**: pnpm prepends `./node_modules/.bin` and the workspace `.bin` to the front of `PATH` before running a script, so an inherited shim dir never beats them for `vitest`/`eslint`/`tsgo`/`oxfmt`. The per-command script prefix is the working substitute; a spawn-level interceptor (`NODE_OPTIONS`) — and the committed allowlist that transparent no-prefix routing would need — stays deferred with it → [specs/adoption.md](specs/adoption.md).
  - [ ] Whole-repo / always-on routing stays deferred: warm-fork has landed, but `Auto` still resolves to native, so blanket routing is overhead with no isolation — adopt per command via the prefix instead → [deferred/whole-repo-routing.md](deferred/whole-repo-routing.md).
- [ ] Firecracker microVM backend for untrusted multi-tenant / CI fan-out.
- [ ] Task cache (skip unchanged builds) — evaluate reusing Turborepo cache vs native.
- [ ] CI recipe: ephemeral sandbox per PR from a warm snapshot.
