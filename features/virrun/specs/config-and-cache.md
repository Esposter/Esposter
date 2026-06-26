# virrun — Config & Cache

The two on-disk artifacts virrun reads and writes inside a consuming repo: `virrun.config.json` (the routing allowlist) and `.virrun/` (the local cache). Together they are adoption levels 3–4 made concrete — what a repo commits to route commands, and what virrun materializes locally to make routing fast.

## Overview

The `virrun -- <cmd>` prefix needs nothing on disk. The moment routing moves off the command line — into a checked-in allowlist (adoption level 3) and a PATH shim (level 4) — virrun needs (a) a config file declaring which commands route, committed and reviewable like code, and (b) a local cache holding the shared dependency store and warm snapshots so routed runs are fast. This spec fixes the schema and layout for both so they are stable before any code reads them. → [adoption](adoption.md)

Keep the MVP minimal: the first config is a flat allowlist, and the first cache holds only what the shipped backends produce. The richer surface (`virrun init`, `virrun cache clean`, schema validation, `--help`) arrives with the citty CLI migration, not before — see [deferred/citty-cli.md](../deferred/citty-cli.md).

## `virrun.config.json` (committed)

Repo-root config naming which commands route through the sandbox. Removing an entry un-adopts that command repo-wide in one edit; the file lives in version control so what is adopted is reviewable and revertible like any change.

```jsonc
{
  "route": ["pnpm install", "vitest"], // commands matched (by leading tokens) route through the sandbox
  "backend": "auto", // BackendType: auto | native | vfs | os
  "fallback": "native", // on unsupported/slower/divergent → defer here, never error the build
}
```

- **Resolution** — walk up from cwd to the first `virrun.config.json` (repo root in this monorepo). Absent file = nothing routes; the prefix and shim both no-op to native. No config is a valid, fully-functional state.
- **Matching** — a command routes if its leading tokens match a `route` entry; everything else stays native. Per-command granularity is the whole point.
- **Auto-fallback** is config-driven but gate-enforced: unsupported host/backend, a benchmark-gate regression, or a differential-correctness divergence all defer to `fallback`. → [adoption](adoption.md#auto-fallback-the-safety-net) · [benchmarking](benchmarking.md) · [correctness](correctness.md)

## `.virrun/` (cache — gitignored)

Local, machine-specific, fully disposable. Deleting it only forces the next routed run to repopulate. Never committed.

```text
.virrun/
  store/       # shared content-addressable dep store (Phase 2)
  snapshots/   # warm post-install snapshots, keyed by lockfile hash (Phase 3)
```

- **`store/`** — deps downloaded once so repeated installs skip the network. The Phase 2 `os` backend writes pnpm packages to `.virrun/store/pnpm` and bind-mounts that directory into each sandbox; package imports use copy until the snapshot layer can safely restore true hardlink-style installs. → [architecture.md](../architecture.md#where-the-speed-comes-from)
- **`snapshots/`** — "clone + install" frozen once; each routed run `fork()`s the matching snapshot. Keyed by lockfile hash so a dependency change invalidates exactly the affected entry. → [snapshot-fork](snapshot-fork.md)
- **`.gitignore`** — virrun adds `/.virrun/` to the consuming repo's ignore list on first write (and the line ships in this repo's root `.gitignore` when dogfooding begins). Subdirs are created lazily by the backend/snapshot layer that owns them — absent until that phase ships.

## Constraints / Notes

- Config is committed and reviewable; cache is gitignored and disposable — the split is deliberate. Routing decisions are code; materialized bytes are not.
- MVP is read-only of a hand-written config plus lazy cache dirs. Generation (`virrun init`), inspection (`virrun cache ls`), and cleanup (`virrun cache clean`) are CLI subcommands deferred to the citty migration. → [deferred/citty-cli.md](../deferred/citty-cli.md)
- The cache only ever holds what a shipped backend produces: `store/pnpm/` follows the Phase 2 CAS dep store, `snapshots/` follows Phase 3 warm-fork. Snapshot dirs stay absent until that phase lands.
- Routing the whole repo at once is explicitly out — see [deferred/whole-repo-routing.md](../deferred/whole-repo-routing.md).
