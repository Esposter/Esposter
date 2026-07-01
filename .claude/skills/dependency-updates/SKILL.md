---
name: dependency-updates
description: Esposter dependency update process — all versions in pnpm-workspace.yaml catalog, caret prefix rules, pinned packages (h3), and tracked open issues. Apply when updating package versions.
---

# Dependency Updates

All version numbers live in the `catalog:` section of `pnpm-workspace.yaml` at the repo root. Individual `package.json` files reference them with `catalog:` — never edit version numbers there.

## Process

1. **Check what's outdated and mismatched** (from repo root): `pnpm outdated:dependencies`
2. **Update versions** in `pnpm-workspace.yaml` — all non-pinned packages need a `^` caret prefix.
3. **Tell the user to refresh the lockfile** — do NOT run it yourself. Have them run `pnpm refresh:lockfile` from the repo root.
4. **Verify dependency sync** — after refresh, re-run `pnpm outdated:dependencies`. It checks manifests use `catalog:`/`workspace:`, catalog + configDependency specifiers against lockfile resolutions, and catalog/configDependency/`engines` entries against npm latest. Skip updates per the pinned/tracked-issue notes below; fix mismatches in `pnpm-workspace.yaml` and re-run `pnpm refresh:lockfile` until it passes.

`engines` (e.g. `node`) is read from every `package.json` and checked against the matching npm package's latest version (`node` → the `node` npm package). They are not catalog entries — for `node`, never hand-edit it; run `pnpm update:node` (see below).

### Updating node

Don't hand-edit the node version — run `pnpm update:node [version]` from the repo root. With no argument it targets the latest stable node from the npm registry. In one call it:

1. Bumps `engines.node` in root `package.json` (CI reads this via `node-version-file: package.json`, so it's the single source of truth)
2. Bumps the `@types/node` catalog entry to the highest release matching the new node major
3. Installs the new version with fnm, sets it as the default, and switches the current shell to it (`fnm install`/`default`/`use`)
4. Enables corepack on the new version (a freshly installed node ships it disabled, so `pnpm` would otherwise be missing)
5. Schedules removal of the old version — fnm can't delete a node version while it's in use, so a detached process retries `fnm uninstall <old>` until this call's node processes exit, then removes it (self-cleaning, no process killing)

The TS orchestration (`scripts/updateNode/`) resolves versions and edits the manifests; the per-OS `install.ps1`/`install.sh` (dispatched via `crossOS`, like `refresh:lockfile`) do the fnm work. Pure helpers (version selection, manifest editing) live beside them with unit tests; the generic registry/version utilities are shared from `scripts/services/`.

It deliberately does **not** refresh the lockfile (per step 3 above). After it finishes, run `pnpm refresh:lockfile` to resolve the new `@types/node`, and `fnm use` in any other open shells.

When `@electric-sql/pglite` changes between minor versions, regenerate the db-mock data directory snapshot from `packages/db-mock/` with `pnpm snapshot:gen`, then verify the db-mock tests. The committed `packages/db-mock/src/snapshot.tar.gz` is tied to PGlite's dump format and may need refreshing even without schema changes.

## Pinned packages (do not update)

- **`h3`** — skip major/RC bumps; only update minor/patch within the current major.
- **`@vue/language-core`, `vue-tsc`** — pinned to `3.3.5` (no caret); 3.3.6+ broken. Keep majors matched.

## Overrides (`overrides:` in `pnpm-workspace.yaml`)

Temporary overrides that force a transitive dep to a safe version. Remove when the upstream package catches up. Each override comment must be prefixed with `# @TODO:` so they're easy to search for and clean up later.

## Tracked issues (update normally, but watch these)

- **`oxlint`** — has `^`; open issue https://github.com/oxc-project/oxc/issues/13204.
- **`ajv`, `ajv-errors`, `ajv-formats`, `ajv-i18n`, `debug`** — required by `@koumoul/vjsf`; tracked at https://github.com/json-layout/json-layout/issues/5.
- **`db:run` script** — workaround for https://github.com/drizzle-team/drizzle-orm/issues/1228.

## Dependency placement (deps vs peerDeps)

A `peerDependencies` entry covers everything — keep the dep there and **nowhere else**. Never duplicate a peer in `dependencies` or `devDependencies`. pnpm's `auto-install-peers` (default true) installs peers into the workspace, so they resolve for the package's own build/test as well as for consumers. Listing the same package again is dead weight and risks version drift.

Evidence: `db-schema`/`db`/`db-mock` declare `drizzle-orm` as a peer only (no dev copy), yet import it in source + tests and build fine. If a package is in `peerDependencies`, strip it from `dependencies`/`devDependencies`.

## Caret rules

Every catalog entry must have `^` except pinned packages listed above. If an entry is missing `^` with no entry in the pinned list above, add it when updating.
