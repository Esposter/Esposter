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

`engines` (e.g. `node`) is read from every `package.json` and checked against the matching npm package's latest version (`node` → the `node` npm package). Bump these directly in `package.json` — they are not catalog entries.

When `@electric-sql/pglite` changes between minor versions, regenerate the db-mock data directory snapshot from `packages/db-mock/` with `pnpm snapshot:gen`, then verify the db-mock tests. The committed `packages/db-mock/src/snapshot.tar.gz` is tied to PGlite's dump format and may need refreshing even without schema changes.

## Pinned packages (do not update)

- **`h3`** — skip major/RC bumps; only update minor/patch within the current major.

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
