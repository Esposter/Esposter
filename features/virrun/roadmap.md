# virrun — Roadmap

What to work on next. Shipped work lives in [README.md](README.md) `## Shipped`; decided ideas live in [out-of-scope/](out-of-scope) + [deferred/](deferred) — grep both before adding an item.

## Now

- [ ] **Platform-correct warm snapshots** — a snapshot captured on a win32 host must own the full _Linux_ dependency closure, never the host's win32-only optional binaries. Today a snapshot captured under the old `/mnt/c` source-lower semantics survives the ext4-mirror change (which excludes `node_modules` from the source lower) and is silently reused, exposing `@esbuild/win32-x64` / `@typescript/native-preview-win32-x64` to the Linux sandbox — which crashes (`needs the "@esbuild/linux-x64" package instead`). Root cause: the snapshot key is `sha256(lockfile)` **only** (`resolveSnapshotLocation.ts`), so a capture-strategy change doesn't invalidate the cache. → [specs/platform-correct-snapshots.md](specs/platform-correct-snapshots.md)
  - [ ] Version the snapshot cache address (`<hash>.v<SNAPSHOT_SEMANTICS_VERSION>`) so a capture-strategy change orphans old snapshots instead of reusing them; bump it on this fix so every existing snapshot re-captures once
  - [ ] Differential/equivalence test that seeds a **foreign-platform `node_modules`** in the source corpus and asserts the fork still exposes the current platform's native binary — the case the node_modules-free `createWorkspaceCorpus` never exercised (the test gap that let this ship)
  - [ ] `virrun doctor` (or first-fork) warns when the host `node_modules` platform ≠ sandbox platform, so a leak surfaces as a diagnostic, not a native-binary crash mid-run

- [ ] **WSL mirror bench** — re-run `pnpm bench` on win32, record the lift in `localMonorepo.platform.bench.win32.md` (honest numbers — no overclaim). **Blocked**: this host's WSL sandbox errors (`node.exe: Invalid argument`), so the bench can't capture; needs a healthy WSL host.

## Next

Deferred until a trigger fires (each file states its own):

- **Broaden the isolation surface** — macOS bridge (Linux VM) + Firecracker microVM backend. → [deferred/additional-isolation-targets.md](deferred/additional-isolation-targets.md)
- **Snapshot upper on tmpfs** — warm forks read `node_modules` from RAM. → [deferred/snapshot-upper-tmpfs.md](deferred/snapshot-upper-tmpfs.md)
- **Whole-repo routing** — one switch instead of per-command prefixing. → [deferred/whole-repo-routing.md](deferred/whole-repo-routing.md)
- **WASM runtime backend** — zero host setup, no native addons. → [deferred/wasm-runtime.md](deferred/wasm-runtime.md)
