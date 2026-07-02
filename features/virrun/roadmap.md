# virrun — Roadmap

What to work on next. Shipped work lives in [README.md](README.md) `## Shipped`; decided ideas live in [out-of-scope/](out-of-scope) + [deferred/](deferred) — grep both before adding an item.

## Now

- [ ] **WSL ext4 source mirror** — read the repo source from a WSL-native ext4 mirror instead of `/mnt/c`, killing the v9fs read tax that makes win32 `os`/wsl 0.06–0.31× native (vs Linux 0.76–0.95×). The Phase 7 "overhead is inherent" verdict was ext4-only and never covered this. → [specs/wsl-source-sync.md](specs/wsl-source-sync.md)
  - [ ] `ensureWslSourceMirror` — `<cache>/sources/<sha256(hostCwd)>`, per-mirror `flock`, incremental `rsync -a --delete` (excludes `node_modules` + `.git`), returns the ext4 `/home/...` path
  - [ ] Wire into `createWslBwrapArgs` — use the mirror for `--overlay-src`/`--chdir` (`:24`); verify `persistRun` flush target stays `options.cwd` (host-side, unchanged)
  - [ ] Add an `rsync` presence check to `virrun doctor` (`probeOsBackendChecks`); extend `cache clean` to sweep `sources/`
  - [ ] Re-run `pnpm bench` on win32, record the lift in `localMonorepo.platform.bench.win32.md` (honest numbers — no overclaim)

## Next

Deferred until a trigger fires (each file states its own):

- **Broaden the isolation surface** — macOS bridge (Linux VM) + Firecracker microVM backend. → [deferred/additional-isolation-targets.md](deferred/additional-isolation-targets.md)
- **Snapshot upper on tmpfs** — warm forks read `node_modules` from RAM. → [deferred/snapshot-upper-tmpfs.md](deferred/snapshot-upper-tmpfs.md)
- **Whole-repo routing** — one switch instead of per-command prefixing. → [deferred/whole-repo-routing.md](deferred/whole-repo-routing.md)
- **WASM runtime backend** — zero host setup, no native addons. → [deferred/wasm-runtime.md](deferred/wasm-runtime.md)
