# virrun — Roadmap

What to work on next. Shipped work lives in [README.md](README.md) `## Shipped`; decided ideas live in [out-of-scope/](out-of-scope) + [deferred/](deferred) — grep both before adding an item.

## Now

- **`virrun doctor`** — a diagnostic subcommand that probes the `os`-backend prerequisites (bubblewrap `>= 0.10.0`, a Linux `node` inside WSL2 on win32, `python3` for write-back) and reports, per check, ok / missing + the fix, exiting non-zero when the backend would fall back to native. Turns the silent capability probe into an actionable UX surface. → [specs/adoption.md](specs/adoption.md)

## Next

Deferred until a trigger fires (each file states its own):

- **Broaden the isolation surface** — macOS bridge (Linux VM) + Firecracker microVM backend. → [deferred/additional-isolation-targets.md](deferred/additional-isolation-targets.md)
- **Snapshot upper on tmpfs** — warm forks read `node_modules` from RAM. → [deferred/snapshot-upper-tmpfs.md](deferred/snapshot-upper-tmpfs.md)
- **Whole-repo routing** — one switch instead of per-command prefixing. → [deferred/whole-repo-routing.md](deferred/whole-repo-routing.md)
- **WASM runtime backend** — zero host setup, no native addons. → [deferred/wasm-runtime.md](deferred/wasm-runtime.md)
