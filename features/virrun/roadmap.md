# virrun — Roadmap

Phased, prioritized backlog. Early phases ship something usable with pure npm; later phases add the OS-level native core and distribution. Grep [out-of-scope/](out-of-scope) + [deferred/](deferred) before adding items. Sweep finished features to README `## Shipped`.

## Gates (continuous — every phase)

These run from the first backend onward, not as a phase. A change that fails either does not ship.

- [x] **Speed harness** — native-baseline benchmark over a fixed repo corpus, cache-state matrix → [specs/benchmarking.md](specs/benchmarking.md). Any path slower than baseline gets cut. CI signal is **CodSpeed simulation** (hardware-independent, on every push via 🏎️ Bench) plus the committed `*.bench.md` offline diff; a hard wall-clock CI fail is rejected as runner-noise-flaky → [out-of-scope/ci-walltime-gate.md](out-of-scope/ci-walltime-gate.md).
- [x] **Differential correctness suite** — shared harness: a growing command corpus (`services/exec/differential/differentialCorpus.test.ts`), an explicit `normalizeExecResult` masking seam (no implicit normalization, so real diffs are never hidden), and the `assertDifferential` helper the `os` and `vfs` backends both run their corpus through → [specs/correctness.md](specs/correctness.md). Grow the corpus on every gap; every fixed bug becomes a golden regression test. **CI-enforced**: the `*.differential.test.ts` files run in the 🏗️ CI coverage shards (bubblewrap enabled), so a divergence hard-fails the build.

Phases 0–1 (foundations + the `vfs` backend — FS layer + in-process `node -e`/`node <file>` runner, both gates passed) and Phase 3 (snapshot + warm-fork) are fully shipped; Phase 2's `os` backend is shipped bar the macOS bridge. See README `## Shipped` and the linked specs. Open work below.

## Phase 2 — `os` backend (the native core)

Done — bwrap RAM-overlay exec, in-RAM full-monorepo install proof, shared CAS dep store, WSL2 bridge → README `## Shipped` · [specs/exec-isolation.md](specs/exec-isolation.md).

- [ ] macOS bridge through a lightweight Linux VM.

## Phase 5 — Write-back (native-equivalent persistence)

The last limitation before full adoption: sandbox writes vanish, so only read-only commands carry the prefix. Persist a mutation command's produced files back to the host so `virrun -- <cmd>` leaves disk exactly as native would, unblocking `eslint --fix` / `oxfmt` / `db:gen` / `export:gen` / `build` and letting every command move onto `virrun --`. Decouples warm-deps (always on) from persist (default for a normal run; the ephemeral fork stays for CI/verification). → [specs/write-back.md](specs/write-back.md)

- [ ] `isPersisted` exec option + `persistRun` — fork the warm snapshot with a persistable top upper instead of `--tmp-overlay`.
- [x] `parseOverlayEntryKind` + `buildFlushPlan` (pure, unit-tested) — classify an upper entry (regular vs char-dev `0:0` whiteout vs `user.overlay.opaque` dir) and order it into copy/delete ops, skipping snapshot-lower (dep-tree) paths. Overlay format empirically confirmed (userxattr, unprivileged reads).
- [ ] `readOverlayOpaque` (xattr reader seam: `getfattr` → `python3`) + the overlay-upper walker feeding `buildFlushPlan`.
- [ ] `flushUpperToHost` — apply the plan to `<cwd>` (Linux-side; via `wsl.exe` on win32).
- [ ] WSL boundary flush — translate upper + host paths via memoized `readWslPath`, copy the changed subset Linux→Windows.
- [ ] All-or-nothing on non-zero exit (flush nothing; never leave a half-written tree).
- [ ] **Equivalence gate** — `assertEquivalent` (native vs `virrun --`, diff resulting host file trees) + a mutation-command corpus (`eslint --fix`, `oxfmt`, `db:gen`, `export:gen`, `build`); CI-enforced in the 🏗️ coverage shards beside the differential suite.
- [ ] Dogfood: add the prefix to the mutating siblings in this repo's scripts once the gate holds; sweep to README `## Shipped`.

## Phase 4 — Distribution & CI

- [x] Migrate the CLI to [unjs/citty](https://github.com/unjs/citty) for declarative subcommands/flags/`--help`, then add `virrun run`, `virrun exec`, `virrun snapshot`, `virrun init`, `virrun cache` (ls/clean) — extends the Phase 0 prefix CLI. Shipped → README `## Shipped` · getting-started subcommand table. The bare `virrun -- <cmd>` prefix is preserved as citty's default subcommand (`run`).
- [x] Config backend selection (adoption level 3) — committed `virrun.config.json` (`backend`/`fallback`) resolved via `empathic` with host-support auto-fallback; no allowlist (the `virrun -- <cmd>` prefix is the switch), lazy `.virrun/` materialization, and a `VIRRUN=true` output signal. Benchmark-gate / differential-correctness fallbacks remain future work. Shipped → README `## Shipped` · [specs/config-and-cache.md](specs/config-and-cache.md). The level-4 PATH shim and always-on whole-repo routing were measured unviable / stay deferred → [deferred/whole-repo-routing.md](deferred/whole-repo-routing.md).
- [ ] Firecracker microVM backend for untrusted multi-tenant / CI fan-out.
- [ ] Task cache (skip unchanged builds) — evaluate reusing Turborepo cache vs native.
