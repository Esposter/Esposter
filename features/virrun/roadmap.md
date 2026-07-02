# virrun — Roadmap

What to work on next. Shipped work lives in [README.md](README.md) `## Shipped`; decided ideas live in [out-of-scope/](out-of-scope) + [deferred/](deferred) — grep both before adding an item.

## Now

Nothing open on the shipped Linux/WSL `os` path. Promote one item from **Next** when its trigger fires.

## Next

Deferred until a trigger fires (each file states its own):

- **Broaden the isolation surface** — macOS bridge (Linux VM) + Firecracker microVM backend. → [deferred/additional-isolation-targets.md](deferred/additional-isolation-targets.md)
- **Snapshot upper on tmpfs** — warm forks read `node_modules` from RAM. → [deferred/snapshot-upper-tmpfs.md](deferred/snapshot-upper-tmpfs.md)
- **Whole-repo routing** — one switch instead of per-command prefixing. → [deferred/whole-repo-routing.md](deferred/whole-repo-routing.md)
- **WASM runtime backend** — zero host setup, no native addons. → [deferred/wasm-runtime.md](deferred/wasm-runtime.md)
