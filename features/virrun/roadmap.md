# virrun — Roadmap

What to work on next. Shipped work lives in [README.md](README.md) `## Shipped`; decided ideas live in [out-of-scope/](out-of-scope) + [deferred/](deferred) — grep both before adding an item.

## Now

Nothing actively queued. The items in `## Next` are trigger-gated (each file states its trigger) — promote one here when its trigger fires. (Latest shipped: source-mirror manifest delta sync, 2026-07-04 — see README `## Shipped` and [specs/wsl-source-sync.md](specs/wsl-source-sync.md) for the measured lift.)

## Next

Deferred until a trigger fires (each file states its own):

- **Prepare layer narrow key** — stop re-keying the `.nuxt` regen on every source edit; the biggest remaining win32 dirty-tree cost, blocked on a provably safe input predicate. → [deferred/prepare-layer-narrow-key.md](deferred/prepare-layer-narrow-key.md)
- **Broaden the isolation surface** — macOS bridge (Linux VM) + Firecracker microVM backend. → [deferred/additional-isolation-targets.md](deferred/additional-isolation-targets.md)
- **Snapshot upper on tmpfs** — warm forks read `node_modules` from RAM. → [deferred/snapshot-upper-tmpfs.md](deferred/snapshot-upper-tmpfs.md)
- **Whole-repo routing** — one switch instead of per-command prefixing. → [deferred/whole-repo-routing.md](deferred/whole-repo-routing.md)
- **WASM runtime backend** — zero host setup, no native addons. → [deferred/wasm-runtime.md](deferred/wasm-runtime.md)
