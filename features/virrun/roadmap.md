# virrun — Roadmap

What to work on next. Shipped work lives in [README.md](README.md) `## Shipped`; decided ideas live in [out-of-scope/](out-of-scope) + [deferred/](deferred) — grep both before adding an item.

## Now

Nothing actively queued. The items in `## Next` are trigger-gated (each file states its trigger) — promote one here when its trigger fires.

- [x] **Source-mirror manifest delta sync (win32)** — shipped 2026-07-04: the per-run mirror rsync stat-walked the whole tree over 9p (~12.5s at zero changes, the entire win32 floor); replaced by a host-FS manifest diff that syncs only changed files, folded into the run's own `wsl.exe` invocation and skipped outright on a clean tree. → [specs/wsl-source-sync.md](specs/wsl-source-sync.md), README `## Shipped`. Win32 bench regenerated same day: `vs base` moved from 0.07–0.34× to 0.46–0.91× (build/test now in the Linux 0.84–0.95× band; typecheck-cold 0.46× because a ~0.9s command still pays the fixed sandbox setup).

## Next

Deferred until a trigger fires (each file states its own):

- **Broaden the isolation surface** — macOS bridge (Linux VM) + Firecracker microVM backend. → [deferred/additional-isolation-targets.md](deferred/additional-isolation-targets.md)
- **Snapshot upper on tmpfs** — warm forks read `node_modules` from RAM. → [deferred/snapshot-upper-tmpfs.md](deferred/snapshot-upper-tmpfs.md)
- **Whole-repo routing** — one switch instead of per-command prefixing. → [deferred/whole-repo-routing.md](deferred/whole-repo-routing.md)
- **WASM runtime backend** — zero host setup, no native addons. → [deferred/wasm-runtime.md](deferred/wasm-runtime.md)
