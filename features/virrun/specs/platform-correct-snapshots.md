# virrun — Platform-Correct Warm Snapshots

A warm snapshot captured on a win32 host must own the full **Linux** dependency closure — the platform the sandbox actually runs. Reusing a snapshot built under a different source-lower strategy (or a different host platform) must never expose a wrong-platform native binary to the sandbox.

## Overview

The snapshot cache key is `sha256(lockfile)` **only** (`computeLockfileHash.ts` → `resolveSnapshotLocation.ts`). That was sound while capture semantics were fixed: same lockfile → same warm closure. Two changes broke the assumption without touching the key:

- `feat: Add wsl ext4` — the win32 source lower became a WSL-native ext4 **mirror that excludes `node_modules`** (`ensureWslSourceMirror`), so the capture install no longer sees the host tree under the source lower.
- `perf: don't re-install, just prune and grab from under source files` — capture leans on `node_modules` presented under the source lower rather than a postinstall replay.

A snapshot captured under the **old `/mnt/c` semantics** (host win32 `node_modules` as the base layer) still keys to the same lockfile hash, so it survives both changes and is silently forked. Its base layer is now gone/mismatched, leaving only the win32 copy-ups — and the Linux sandbox crashes the moment a native binary is invoked:

```
You installed esbuild for another platform than the one you're currently using.
... the "@esbuild/win32-x64" package is present but this platform needs the "@esbuild/linux-x64" package instead.
```

Same failure via `@typescript/native-preview` (`tsgo`): `Unable to resolve @typescript/native-preview-linux-x64`. Both errors resolve under `/mnt/c/.../node_modules/.pnpm/…` — the raw host (win32) tree.

## Why the correctness gate didn't catch it

The differential/equivalence gate is real and **does** run a native binary — `forkSnapshot.equivalence.test.ts` runs esbuild's binary and asserts its version. But `createWorkspaceCorpus` assembles the fixture repo "into a fresh dir with **NO node_modules**", so the capture install always resolves a clean, current-platform closure. **No test ever seeds a foreign-platform `node_modules` in the source corpus** — the exact real-world condition (a real win32 repo whose `node_modules` is win32-only) that triggers the leak. The gate can't fire on a case it never sets up. This spec adds that case.

## Mechanism

1. **Version the snapshot address.** Add a `SNAPSHOT_SEMANTICS_VERSION` constant (snapshot `constants.ts`). `resolveSnapshotLocation` addresses the snapshot dir as `<hash>.v<version>` (the raw lockfile hash stays `SnapshotLocation.hash` for the `[virrun] … (lockfile <hash>)` display; only the on-disk `dir`/`upperDir` carry the suffix). Bump the version on this fix, so every existing snapshot is orphaned and re-captured once under the current (mirror, empty-`node_modules`) semantics. Any future capture-strategy change bumps it again — old snapshots are never silently reused. Orphaned dirs are swept by `cache clean --all` (already recursive over `snapshots/`).
2. **Foreign-platform corpus test.** A new equivalence/differential case seeds the source corpus with a `node_modules` containing a **foreign-platform** optional-dep marker (e.g. only `@esbuild/win32-x64` present), captures a snapshot, forks it, and asserts the fork exposes the **current platform's** native binary and runs it. Guards the invariant directly: a wrong-platform host tree must not leak into the warm closure.
3. **Leak diagnostic (defense-in-depth).** `virrun doctor` (or the first fork) compares the host `node_modules` platform against the sandbox platform; a mismatch prints a diagnostic pointing at `cache clean`, so a stale/mismatched snapshot surfaces as a named check rather than an opaque native-binary crash mid-run.

## Why this is contained

- The version suffix lives entirely in `resolveSnapshotLocation`; `computeLockfileHash` stays a pure lockfile sha (still used by the task-cache key and the display), and the printed "lockfile" hash is unchanged.
- Cache listing/cleaning already `readdirSync` the `snapshots/` dir and treat entries as opaque names — a `<hash>.v<n>` entry lists and cleans unchanged.
- Going forward both live paths are already platform-correct: on win32 the mirror gives the capture install an empty-`node_modules` source lower (clean Linux install); on native Linux the host `node_modules` **is** the sandbox platform. The bug is strictly stale snapshots crossing the semantics change — the version key closes exactly that, no capture-path rewrite required.

## Key Files

| File                                                    | Role                                                                                         | Status   |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------- |
| `services/exec/snapshot/constants.ts`                   | add `SNAPSHOT_SEMANTICS_VERSION`                                                              | edit     |
| `services/exec/snapshot/resolveSnapshotLocation.ts`     | address `dir`/`upperDir` as `<hash>.v<version>`; keep `hash` = raw lockfile sha for display   | edit     |
| `services/exec/snapshot/resolveSnapshotLocation.test.ts`| assert the versioned address + that `hash` stays the raw lockfile sha                         | edit     |
| `services/exec/snapshot/*.equivalence.test.ts` (new)    | foreign-platform `node_modules` corpus → fork exposes the current-platform native binary      | new      |
| `services/exec/test/createWorkspaceCorpus.test.ts`      | optional seam to seed a foreign-platform `node_modules` marker into the corpus                | edit     |
| `services/cli/doctor/probeOsBackendChecks.ts`           | host-vs-sandbox `node_modules` platform mismatch check                                        | edit     |

## Constraints / Notes

- **Immediate unblock is `virrun cache clean`** (or `--all`): drops the stale snapshot; the next capture runs through the mirror's empty-`node_modules` source lower → clean Linux closure. The version bump makes this automatic and one-time for every user on upgrade.
- **The version is a semantics token, not a code hash.** Bump it by hand when the capture strategy changes (source-lower composition, prune rules, install command). Deriving it from a source hash would churn the cache on unrelated edits.
- **Task cache** is keyed by `sha256(lockfile-hash + working-tree-hash + command)` and replays a recorded diff, not a dep tree, so it isn't the vector here — but if a future change alters what a persist run records, the same versioning discipline applies to its key.
- **Rejected: fold the version into `computeLockfileHash`.** That would change the displayed "lockfile" hash (misleading — it's no longer the lockfile's sha) and churn the task-cache key for a snapshot-only concern. Keep the lockfile hash pure; version only the snapshot address.
- **Rejected: shadow `node_modules` with an empty tmpfs at capture as the primary fix.** Redundant with the mirror on win32 and adds a mount on the hot path; the version key already guarantees a clean re-capture. Kept only as the doctor diagnostic, not a capture-path change.

## End-To-End Plan

- **Today**: stale win32 snapshots expose win32 native binaries to the Linux sandbox and crash; the gate misses it because the corpus is `node_modules`-free.
- **Rollout**: (1) `SNAPSHOT_SEMANTICS_VERSION` + versioned address in `resolveSnapshotLocation`; (2) foreign-platform corpus equivalence test; (3) `virrun doctor` mismatch check; (4) note the one-time re-capture in the changelog.
- **Correctness**: the new foreign-platform test fails on any leak; the versioned address is unit-tested; the existing differential + equivalence corpora keep gating the rest.
- **Verification limit**: the win32 → Linux native-dep path only reproduces on a healthy win32+WSL host (this repo has no such CI runner — the same gap that hid the bug). The version key and the foreign-platform test run on Linux CI; the end-to-end win32 confirmation waits on a healthy WSL host (shared with the mirror-bench blocker).
