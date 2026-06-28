# virrun — Config & Cache

The two on-disk artifacts virrun reads and writes inside a consuming repo: `virrun.config.json` (the backend selection) and `.virrun/` (the local cache). Together they are adoption levels 3–4 made concrete — what a repo commits to configure the sandbox, and what virrun materializes locally to make sandboxed runs fast.

## Overview

The `virrun -- <cmd>` prefix is the switch: every prefixed command is sandboxed, and that needs nothing on disk. The config exists only to answer the second question — _which backend_ a sandboxed command runs through — once a repo wants that pinned and reviewable rather than left to the `auto` default (adoption level 3). virrun also keeps (b) a local cache holding the shared dependency store and warm snapshots so sandboxed runs are fast. This spec fixes the schema and layout for both so they are stable before any code reads them. → [adoption](adoption.md)

Keep the MVP minimal: the first config is two backend fields, and the first cache holds only what the shipped backends produce. The richer surface (`virrun init`, `virrun cache clean`, schema validation, `--help`) arrives with the citty CLI migration, not before — see [deferred/citty-cli.md](../deferred/citty-cli.md).

## `virrun.config.json` (committed)

Repo-root config selecting which backend a sandboxed command runs through. The file lives in version control so the backend choice is reviewable and revertible like any change. It does **not** decide _whether_ a command is sandboxed — that is the prefix's job, per command.

```jsonc
{
  "backend": "auto", // BackendType: auto | native | vfs | os
  "fallback": "native", // on unsupported/slower/divergent → defer here, never error the build
}
```

- **Resolution** — walk up from cwd to the first `virrun.config.json` (repo root in this monorepo). Absent file = the backend defaults to `auto` (native today), so a prefixed command runs exactly as if no config were present. No config is a valid, fully-functional state.
- **No allowlist** — there is no per-command matching. The prefix's presence is the sole opt-in; the config applies the same backend to every command that carries the prefix. Per-command granularity lives in _where you put the prefix_, not in a config list.
- **Auto-fallback** is config-driven but gate-enforced: unsupported host/backend, a benchmark-gate regression, or a differential-correctness divergence all defer to `fallback`. → [adoption](adoption.md#auto-fallback-the-safety-net) · [benchmarking](benchmarking.md) · [correctness](correctness.md)

**Realized** (JSON config only — `.ts`/`.js` config deferred to future loader work): `resolveVirrunConfiguration` walks up via `empathic` (the standard parent-dir file search) and `parseVirrunConfiguration` validates + defaults; the CLI's `resolveBackend` picks the backend, deferring an `os` backend to `fallback` when the host lacks bubblewrap. The benchmark-gate and differential-correctness arms of auto-fallback are still future work.

- **Strict JSON, not jsonc** — the committed file is parsed with `JSON.parse`, so it carries no comments. Field docs come from the shipped `schema.json` (referenced via `$schema`), which renders descriptions/enums on hover in editors — the oxlint pattern (`"$schema": "./node_modules/virrun/schema.json"`). `schema.json` ships in the package `files`; the `backend`/`fallback` enums there mirror `BackendType` (the single source of truth in code), so an enum change updates both.
- **Every field is optional** in the file: `parseVirrunConfiguration` defaults `backend → auto`, `fallback → native`, so a minimal `{}` — or no file at all — is valid and options exist only to override. Unknown keys throw (a typo fails loud, not silent), and the resolved `VirrunConfiguration` object stays fully populated — optionality is the input surface, not the internal contract.
- **No on/off flag — the prefix is the switch.** Opting a command in or out is adding/removing its `virrun --` prefix (a reviewable one-token edit), not toggling an env var or editing a list. virrun does inject a `VIRRUN=true` signal into every command's environment — vitest-style, so a test/config/tool can detect it runs under virrun via `process.env.VIRRUN` (exposed as `isVirrunEnabled`) — but that is an **output** virrun sets, never an input that gates the sandbox.
- **This repo dogfoods it** — the committed root `virrun.config.json` pins the `os` backend, so any `virrun -- <cmd>` runs through bubblewrap on a capable host. Read-only verification commands (`eslint .`, `oxfmt --check`, `tsgo`, `vitest run`) are where the prefix is added; mutating siblings (`oxfmt`, `eslint --fix .`) and watch-mode `vitest` simply don't carry it. `os` falls back to native on hosts without bubblewrap, so the config is a safe no-op until WSL/Linux is in play.

## `.virrun/` (cache — gitignored)

Local, machine-specific, fully disposable. Deleting it only forces the next routed run to repopulate. Never committed.

```text
<repo>/.virrun/        # repo-local, gitignored
  store/               # shared content-addressable dep store (Phase 2)

~/.virrun/             # host-global (VIRRUN_CACHE_HOME override), shared across repos/CI
  snapshots/<hash>/    # warm post-install snapshots, keyed by lockfile hash (Phase 3)
    upper/  work/       # overlayfs layers — upper persists the install, work is overlay scratch
```

- **`store/`** (repo-local) — deps downloaded once so repeated installs skip the network. The Phase 2 `os` backend writes pnpm packages to `<repo>/.virrun/store/pnpm` and bind-mounts that directory into each sandbox; package imports use copy until the snapshot layer can safely restore true hardlink-style installs. Repo-local is fine because it is a **bind** mount, and binds may overlap the working-dir overlay. → [architecture.md](../architecture.md#where-the-speed-comes-from)
- **`snapshots/`** (host-global) — "clone + install" frozen once; each routed run `fork()`s the matching snapshot. Keyed by lockfile hash so a dependency change invalidates exactly the affected entry, and shared across repos/CI runs. It lives in `~/.virrun`, **not** the repo, because a fork stacks the snapshot as an **overlay lower** beside the source and overlayfs rejects a lower that nests inside another. → [snapshot-fork](snapshot-fork.md)
- **`.gitignore`** — virrun adds `/.virrun/` to the consuming repo's ignore list on first write (and the line ships in this repo's root `.gitignore` when dogfooding begins). Subdirs are created lazily by the backend/snapshot layer that owns them — absent until that phase ships. The global `~/.virrun` needs no ignore entry.

## Constraints / Notes

- Config is committed and reviewable; cache is gitignored and disposable — the split is deliberate. The backend choice is code; materialized bytes are not.
- MVP is read-only of a hand-written config plus lazy cache dirs. Generation (`virrun init`), inspection (`virrun cache ls`), and cleanup (`virrun cache clean`) are CLI subcommands deferred to the citty migration. → [deferred/citty-cli.md](../deferred/citty-cli.md)
- The cache only ever holds what a shipped backend produces: `store/pnpm/` follows the Phase 2 CAS dep store, `snapshots/` follows Phase 3 warm-fork. Snapshot dirs stay absent until that phase lands.
- Routing the whole repo at once is explicitly out — see [deferred/whole-repo-routing.md](../deferred/whole-repo-routing.md).
