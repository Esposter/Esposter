# virrun — Write-Back (native-equivalent persistence)

Flush a sandboxed command's produced files back to the host working tree, so `virrun -- <cmd>` leaves disk exactly as native `<cmd>` would — removing the last limitation blocking full adoption.

## Overview

Every sandbox write today lands in a RAM overlay upper and vanishes (`--tmp-overlay`). That is correct for verification (`vitest run`, `eslint .`, `tsgo`) but blocks every **mutation** command — `eslint --fix`, `oxfmt`, `db:gen`, `export:gen`, `pnpm build` — because their output never reaches the host. Write-back runs a mutation command with a **persistable** overlay upper (the Phase 3 capture shape), then bulk-copies that upper's diff back to the host source tree. The guiding principle is the existing correctness gate taken literally: **observably identical to native** (exit/stdout/stderr/**produced files**). No path filtering by name — the overlay layering decides what flushes, so the result is native-equivalent by construction. This is what lets the repo replace every command with `virrun -- <cmd>` and get the speedup everywhere with no per-command carve-outs.

## Principle: native-equivalence, not a guessed file set

A "smart filter" (gitignore-aware, denylist) was rejected: `pnpm build` writes `dist/` which is gitignored yet wanted; any name-based rule guesses wrong eventually. The only stable rule is **leave disk as native would**. The overlay upper already _is_ the native diff — changed/new files, whiteouts for deletes, opaque markers for replaced dirs — so persisting the upper (minus what a lower layer supplies, below) reproduces the native on-disk result without virrun ever deciding which files "matter".

## Two axes, decoupled

The current `os` path bundles "warm deps" and "writes vanish" into one fork. Write-back splits them:

| Axis                                                            | Values           | Default                                                                                     |
| --------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| **Warm deps** (reuse the lockfile-hash snapshot as an RO lower) | on / cold        | **always on** — the speed win; cold only on first run / snapshot miss                       |
| **Persist output** (flush the top upper to host)                | persist / vanish | **persist** for a normal run; **vanish** for an explicitly ephemeral fork (CI/verification) |

Every run forks the warm snapshot; the only thing that varies is the top mount.

```text
normal (mutation):   --overlay-src source(RO)  --overlay-src snapshot(RO)  --overlay <upper> <work> <dir>   → flush <upper> to host
ephemeral (CI/test): --overlay-src source(RO)  --overlay-src snapshot(RO)  --tmp-overlay <dir>              → writes vanish
```

Because `node_modules` lives in the **snapshot lower (RO)**, a normal mutation run's top upper contains only what the command produced _beyond_ the warm baseline (`dist/`, migrations, formatted src) — `node_modules` is structurally never in the flush set, so the "node_modules never touches disk" value prop survives even while output persists.

## Overlay upper format (empirically confirmed)

Probed on a rootless-bubblewrap overlay (kernel 6.6, ext4). Because the overlay is mounted inside a user namespace, it uses **userxattr** — markers live in the `user.overlay.*` namespace, **readable unprivileged** (verified reading them as the normal owner, no root):

| Upper entry                         | On-disk representation                                                       | Detection                                                         |
| ----------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| deleted path (whiteout)             | character device, `rdev` 0:0, mode 0                                         | `lstat`: `S_ISCHR(mode) && rdev === 0` — **no xattr read needed** |
| dir removed-then-recreated (opaque) | directory with xattr `user.overlay.opaque="y"`                               | xattr read of `user.overlay.opaque`                               |
| dir modified in place (merge)       | directory with `user.overlay.origin`/`user.overlay.impure` but **no** opaque | absence of opaque → recurse, do not clear                         |
| created / copied-up file            | regular file (may carry `user.overlay.origin`; irrelevant)                   | default → copy                                                    |

A `build` that cleans its output dir (`rm -rf dist && rebuild`) produces an **opaque** `dist`, so opaque handling is required, not optional.

## Flush algorithm

After the command exits 0, reconcile the top upper into the host working dir (`<cwd>`):

1. **Walk the upper**, classifying each entry per the table above (`parseOverlayEntryKind`):
   - **regular file / dir** → copy to the same relative path under `<cwd>`, overwriting (overlay copy-up already holds the full new content).
   - **whiteout** → `rm -rf` the host path.
   - **opaque dir** → clear the host dir, then copy the upper's children.
2. **Skip snapshot-lower-shadowing paths.** An upper entry whose path is supplied by the warm snapshot lower (a `node_modules`/dep-tree path) is a sandbox-internal write (postinstall patch, `node_modules/.vite` cache), not host state — do not flush it. _Structural_ (layer membership), not a name guess. Source-tree paths and genuinely new repo content always flush.
3. **Bulk copy-out, last.** Copy is sequential over the (small) diff, far cheaper than the random I/O the toolchain did in RAM. Flush runs only after a clean exit; a non-zero exit flushes nothing (all-or-nothing, see Constraints).

## Execution locus & xattr reader

- **Linux-side execution.** The flush walks overlay internals (char-dev whiteouts, `user.overlay.*` xattrs) which a Windows host cannot see over the `\\wsl.localhost` 9p bridge. So on win32 the reconciliation runs **inside WSL** (the os backend already requires a Linux `node` there); on a Linux host it runs in-process. The same code path, invoked directly or via `wsl.exe`.
- **xattr reader seam (`readOverlayOpaque`).** Node has no xattr API. Read `user.overlay.opaque` via `getfattr` (pkg `attr`) when present, else `python3` (`os.getxattr`); both are unprivileged in userxattr mode. Whiteouts/files need no xattr (pure `lstat`), so a missing reader degrades only opaque-dir replacement — documented as a prerequisite alongside bubblewrap.
- **WSL paths.** Translate the temp-upper and host-dir paths once via the memoized `readWslPath` helpers before the Linux-side copy.

## Equivalence gate (the forcing function)

Write-back is unprovable by inspection — it is gated by an **equivalence test**, an extension of the differential corpus to mutation commands:

- Capture one warm dependency snapshot of the workspace corpus, then run a command over it with `persistRun` and assert the produced host files match a native run, while `node_modules` (the snapshot lower) never reaches the host.
- Rather than drive each real tool through its own config — which the manifest-only corpus can't resolve — the corpus exercises the flush **mechanism** every tool relies on, one overlay-entry shape per case: a new top-level file, an in-place edit of an existing source file (the `oxfmt`/`eslint --fix` shape), a newly created nested file under a new directory (the ctix-barrel / `db:gen`-migration shape), a whiteout delete, the `node_modules` drop, and the all-or-nothing rollback on a non-zero exit. Every fixed bug becomes a golden regression case.
- CI-enforced in the 🏗️ coverage shards alongside `*.differential.test.ts` — a divergence hard-fails the build.

## Key Files

All realized. The probe/apply seam shipped as a single python3 script pair (`runOverlayScript` + `parseOverlayManifest`) rather than a per-entry xattr reader, and the equivalence test asserts produced files directly rather than via a separate `assertEquivalent` helper.

| File                                                    | Role                                                                                                                                           |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `models/exec/OverlayEntryKind.ts`                       | enum `Regular`/`Whiteout`/`OpaqueDir` (+ schema) — the classification result                                                                   |
| `services/exec/snapshot/parseOverlayEntryKind.ts`       | pure: classify an upper entry from a parsed manifest entry + its opaque flag                                                                   |
| `services/exec/snapshot/buildFlushPlan.ts`              | pure: turn an upper walk into an ordered `FlushOp[]` (copy / delete / clear-then-copy), skipping snapshot-lower paths                          |
| `services/exec/snapshot/runOverlayScript.ts`            | run the `OVERLAY_PROBE_SCRIPT` / `OVERLAY_APPLY_SCRIPT` python3 seam (direct on Linux; via `wsl.exe` on win32, with `readWslPath` translation) |
| `services/exec/snapshot/parseOverlayManifest.ts`        | zod-validate the probe script's JSON manifest (relative path, opaque flag, snapshot-lower flag) into typed entries                             |
| `services/exec/snapshot/flushUpperToHost.ts`            | probe the upper → classify + order in TS → apply the plan to `<cwd>` Linux-side                                                                |
| `services/exec/snapshot/persistRun.ts`                  | orchestrate: ensure snapshot → fork with a persistable upper → exec → `flushUpperToHost` on exit 0 → tear down upper                           |
| `services/exec/snapshot/persistRun.equivalence.test.ts` | the host-gated write-back equivalence corpus — one overlay-entry shape per case, asserting host parity vs native                               |

Reuses the realized Phase 3 capture machinery (`buildBwrapArgs` `OverlayLayers` persistent-upper shape, per-pid temp dirs, `removeSnapshotDirectory`). The persist-vs-ephemeral choice lives in the orchestrator (`persistRun` parallels `forkSnapshot`), **not** an `ExecOptions` flag — the backend stays a pure executor of an `overlayLayers` shape.

## Constraints / Notes

- **Always warm, persist is the only axis.** Decoupling warm-deps from persist is the core decision — a cold-install-per-mutation design would defeat "speedup everywhere", and re-flushing `node_modules` would defeat "never touches disk". Both are avoided by forking the snapshot and flushing only the top upper.
- **`node_modules` is structurally excluded**, not name-filtered — it lives in the RO snapshot lower, so it is never in the top upper's flush set. A repo that genuinely wants `node_modules` materialized on host (IDE intellisense) is a separate need → [deferred/materialize-node-modules.md](../deferred/materialize-node-modules.md).
- **`pnpm install` is the snapshot-creation path, not a persist run.** Its "output" is the warm snapshot (`createSnapshot` / `virrun snapshot`), not host `node_modules`; it does not go through write-back.
- **All-or-nothing flush.** A non-zero exit flushes nothing, so a failed command never leaves a half-written tree. This is a deliberate, documented divergence from native (which can leave partial output) — equivalence tests assert only the success path.
- **No new config or per-command list.** Persist is the default behavior of a normal `virrun -- <cmd>`; the ephemeral fast path stays reachable for CI/verification. The prefix remains the sole switch (no allowlist), consistent with [adoption.md](adoption.md).
- **Concurrency.** Two persist runs touching the same host paths are last-writer-wins; acceptable — developers don't run two formatters over the same tree at once. The snapshot lower is RO and shared safely (per [snapshot-fork.md](snapshot-fork.md) atomic publish).
