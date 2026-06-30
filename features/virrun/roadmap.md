# virrun — Roadmap

Phased, prioritized backlog. Early phases ship something usable with pure npm; later phases add the OS-level native core and distribution. Grep [out-of-scope/](out-of-scope) + [deferred/](deferred) before adding items. Sweep finished features to README `## Shipped`.

## Gates (continuous — every phase)

These run from the first backend onward, not as a phase. A change that fails either does not ship.

- [x] **Speed harness** — native-baseline benchmark over a fixed repo corpus, cache-state matrix → [specs/benchmarking.md](specs/benchmarking.md). Any path slower than baseline gets cut. CI signal is **CodSpeed simulation** (hardware-independent, on every push via 🏎️ Bench) plus the committed `*.bench.md` offline diff; a hard wall-clock CI fail is rejected as runner-noise-flaky → [out-of-scope/ci-walltime-gate.md](out-of-scope/ci-walltime-gate.md).
- [x] **Differential correctness suite** — shared harness: a growing command corpus (`services/exec/differential/differentialCorpus.test.ts`), an explicit `normalizeExecResult` masking seam (no implicit normalization, so real diffs are never hidden), and the `assertDifferential` helper the `os` and `vfs` backends both run their corpus through → [specs/correctness.md](specs/correctness.md). Grow the corpus on every gap; every fixed bug becomes a golden regression test. **CI-enforced**: the `*.differential.test.ts` files run in the 🏗️ CI coverage shards (bubblewrap enabled), so a divergence hard-fails the build.

Phases 0–1 (foundations + the `vfs` backend — FS layer + in-process `node -e`/`node <file>` runner, both gates passed), Phase 3 (snapshot + warm-fork), and Phase 5 (write-back persistence + the dev-loop dogfood) are fully shipped; Phase 2's `os` backend is shipped bar the macOS bridge. See README `## Shipped` and the linked specs. Open work below.

## Phase 2 — `os` backend (the native core)

Done — bwrap RAM-overlay exec, in-RAM full-monorepo install proof, shared CAS dep store, WSL2 bridge → README `## Shipped` · [specs/exec-isolation.md](specs/exec-isolation.md).

- [ ] macOS bridge through a lightweight Linux VM.

## Phase 5 — Write-back (native-equivalent persistence)

The last limitation before full adoption: sandbox writes vanish, so only read-only commands carry the prefix. Persist a mutation command's produced files back to the host so `virrun -- <cmd>` leaves disk exactly as native would, unblocking `eslint --fix` / `oxfmt` / `db:gen` / `export:gen` / `build` and letting every command move onto `virrun --`. Decouples warm-deps (always on) from persist (default for a normal run; the ephemeral fork stays for CI/verification). → [specs/write-back.md](specs/write-back.md)

- [x] `parseOverlayEntryKind` + `buildFlushPlan` (pure, unit-tested) — classify an upper entry (regular vs char-dev `0:0` whiteout vs `user.overlay.opaque` dir) and order it into copy/delete ops, skipping snapshot-lower (dep-tree) paths including descendants. Overlay format empirically confirmed (userxattr, unprivileged reads).
- [x] Linux-side probe + apply (`OVERLAY_PROBE_SCRIPT`/`OVERLAY_APPLY_SCRIPT` python3) → `parseOverlayManifest` (zod-validated) → `runOverlayScript` (python3 directly / via `wsl.exe`, `readWslPath` translation) → `flushUpperToHost`. Verified: light integration test on win32 + manual WSL end-to-end (content + mode parity).
- [x] `persistRun` + `Virrun.persist` + `createVirrun` wiring — fork the warm snapshot with a persistable upper, flush on a clean exit only (all-or-nothing), tear temps down always.
- [x] CLI `ExecutionMode` — `run`/bare prefix → persist (default), `run --ephemeral` → vanish, `exec` → cold plain.
- [x] Benchmark — `build` persist (write-back) vs native, beside the warm-fork/typecheck/build/test groups.
- [x] Equivalence gate — `persistRun.equivalence.test.ts` (warm snapshot: top-level write flushed, node_modules + writes into it dropped); CI/Linux (win32 blocked by the shared `/mnt/c` install limitation, not write-back).
- [x] Broaden the equivalence corpus to cover every overlay-entry shape the real mutating commands produce — `persistRun.equivalence.test.ts` now asserts a new top-level file, an in-place edit of an existing source file (the `oxfmt`/`eslint --fix` shape), a newly created nested file under a new directory (the ctix-barrel / `db:gen`-migration shape), a whiteout delete, the node_modules drop, and the all-or-nothing rollback on a non-zero exit; runs in the 🏗️ coverage shards. Proves the flush mechanism every mutating sibling relies on rather than each tool's config (the manifest-only corpus can't resolve those).
- [x] Dogfood: the mutating dev-loop scripts route through the prefix — root `format` (`virrun -- oxfmt`), `lint:fix`/`lint:fix:packages`, and now the producing builds `build:app` (`virrun -- nuxt build`) and `build:docs` (`virrun -- typedoc`), whose output flushes to host via write-back; the heavy `depcruise` parse and `outdated:dependencies` are wrapped too. The matching 🏗️ CI `build`/`build-docs` jobs restore the warm snapshot + `install: false`, mirroring `format`/`lint`/`typecheck`. Swept to README `## Shipped`. Two principled carve-outs stay native: `build:packages` is the bootstrap that produces the `virrun` bin every routed command needs (a circular self-host), and `coverage` must stay native because routing it would run the suite _inside_ bwrap, where `isOsBackendSupported()`'s nested-bwrap probe fails and the os-backend differential tests silently `skipIf` away — deleting the correctness gate. `db:gen` also stays native (it writes its migration outside the `db-schema` overlay mount, needing a heavier equivalence proof).

## Phase 4 — Distribution & CI

- [x] Migrate the CLI to [unjs/citty](https://github.com/unjs/citty) for declarative subcommands/flags/`--help`, then add `virrun run`, `virrun exec`, `virrun snapshot`, `virrun init`, `virrun cache` (ls/clean) — extends the Phase 0 prefix CLI. Shipped → README `## Shipped` · getting-started subcommand table. The bare `virrun -- <cmd>` prefix is preserved as citty's default subcommand (`run`).
- [x] Config backend selection (adoption level 3) — committed `virrun.config.json` (`backend`/`fallback`) resolved via `empathic` with host-support auto-fallback; no allowlist (the `virrun -- <cmd>` prefix is the switch), lazy `.virrun/` materialization, and a `VIRRUN=true` output signal. Benchmark-gate / differential-correctness fallbacks remain future work. Shipped → README `## Shipped` · [specs/config-and-cache.md](specs/config-and-cache.md). The level-4 PATH shim and always-on whole-repo routing were measured unviable / stay deferred → [deferred/whole-repo-routing.md](deferred/whole-repo-routing.md).
- [ ] Firecracker microVM backend for untrusted multi-tenant / CI fan-out.
- [ ] Task cache (skip unchanged builds) — evaluate reusing Turborepo cache vs native.

## Phase 6 — Speed deepening (post-core)

The `os` backend + warm-fork + write-back are shipped (3–8× on build/test/typecheck). These are the next speed levers, ranked by value/effort. Rejected levers — a napi/Rust rewrite of the orchestrator and hardlinking the flush — are recorded once in [out-of-scope/rust-napi-orchestrator.md](out-of-scope/rust-napi-orchestrator.md) and [out-of-scope/hardlink-flush.md](out-of-scope/hardlink-flush.md); the thesis is that virrun is spawn/IO-bound, so its own TS is never the bottleneck (the toolchain swap to oxlint/rolldown/oxfmt/tsgo is where "Rust speed" already comes from).

- [ ] **Fix the warm-fork anomaly** — highest value, because the core win is currently _negative_. In `src/localMonorepo.platform.bench.linux.md` (commit `c08666a98`) warm fork is **9193ms vs cold 4119ms** — warm is 2.2× _slower_ than cold, contradicting `forkSnapshot`'s own design note ("should dwarf the cold baseline"; the `99b4ff094` run measured 712ms / 5.8×). `forkSnapshot` only stacks the frozen snapshot upper as a read-only lower with a fresh tmpfs upper — it must not reinstall, so a 9s warm run means something on that path regressed.
  - [ ] Reproduce with `pnpm bench` in `packages/virrun`; the run reported ±2.3% rme, so it is likely real and not WSL2 host noise.
  - [ ] Bisect `99b4ff094` → `c08666a98` for the regressing commit.
  - [ ] Inspect the overlay layering in `forkSnapshot` / `createOsBackend`: is the snapshot upper landing on disk instead of tmpfs, or is the `node_modules` lowerdir being re-stat'd/copied per fork instead of stacked read-only?
  - [ ] Delete the stale `src/localMonorepo.bench.{md,json}` artifacts — the bench file was renamed to `localMonorepo.platform.bench.ts`, so the old `.md`'s 5.8× number now misleads.

- [ ] **Warm daemon** — large; high value for the dev loop; do _after_ the anomaly fix (a sick warm fork makes a resident one worse). Keep a forked snapshot + warm node resident between invocations so repeated `virrun -- pnpm test` amortizes the overlay mount + node boot instead of paying the per-run floor (~700ms healthy) each time.
  - [ ] Resident process keyed by lockfile hash; invalidate + re-fork on lockfile change.
  - [ ] IPC for command dispatch + streamed stdio + exit-code propagation.
  - [ ] Lifecycle: idle timeout, `virrun daemon stop`, crash recovery.
  - [ ] Security: a resident fork is a live sandbox — confirm it cannot outlive its isolation guarantees.

- [ ] **vfs in-process async support** — medium effort; low–medium marginal value on top of the `os` fork; gated hard by the differential-correctness suite. Today `runNodeInProcess` bails to native on any `Promise` result ("an async result needs an event loop we will not spin"), so the no-spawn path only catches trivial _sync_ `node -e`. Draining a controlled microtask/timer loop in-process would let async pure-JS tools skip spawn — but it only saves node-boot (~50–100ms) over the `os` fork and risks the correctness gate (unhandled rejections, timer leaks, require-cache bleed across runs). Scope a spike and prove the gate holds before committing.
