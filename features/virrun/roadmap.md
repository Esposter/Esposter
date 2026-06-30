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
- [x] Dogfood: the mutating dev-loop scripts route through the prefix — root `format` (`virrun -- oxfmt`), `lint:fix`, and `lint:fix:packages` (each `oxlint --fix`/`eslint --fix`/`pnpm -r run lint:fix` step wrapped, mirroring the read-only `lint`). Swept to README `## Shipped`. Deferred: `build:packages` stays native — it is the bootstrap that produces the `virrun` bin every other routed command needs (a circular self-host), exactly as `coverage` stays native (its os-backend tmpfs upper would discard the report). `build:app`/`build:docs` and `db:gen` stay native too — a full Nuxt/TypeDoc build inside the warm-snapshot fork is unproven, and `db:gen` writes its migration to `packages/app/server/db/migrations/`, outside the `db-schema` overlay mount; both need a heavier equivalence proof before routing.

## Phase 4 — Distribution & CI

- [x] Migrate the CLI to [unjs/citty](https://github.com/unjs/citty) for declarative subcommands/flags/`--help`, then add `virrun run`, `virrun exec`, `virrun snapshot`, `virrun init`, `virrun cache` (ls/clean) — extends the Phase 0 prefix CLI. Shipped → README `## Shipped` · getting-started subcommand table. The bare `virrun -- <cmd>` prefix is preserved as citty's default subcommand (`run`).
- [x] Config backend selection (adoption level 3) — committed `virrun.config.json` (`backend`/`fallback`) resolved via `empathic` with host-support auto-fallback; no allowlist (the `virrun -- <cmd>` prefix is the switch), lazy `.virrun/` materialization, and a `VIRRUN=true` output signal. Benchmark-gate / differential-correctness fallbacks remain future work. Shipped → README `## Shipped` · [specs/config-and-cache.md](specs/config-and-cache.md). The level-4 PATH shim and always-on whole-repo routing were measured unviable / stay deferred → [deferred/whole-repo-routing.md](deferred/whole-repo-routing.md).
- [ ] Firecracker microVM backend for untrusted multi-tenant / CI fan-out.
- [ ] Task cache (skip unchanged builds) — evaluate reusing Turborepo cache vs native.
