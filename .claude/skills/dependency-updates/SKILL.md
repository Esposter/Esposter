---
name: dependency-updates
description: Esposter dependency update process — all versions in pnpm-workspace.yaml catalog, caret prefix rules, pinned packages (h3, vue-tsc), and tracked open issues. Apply when updating package versions.
---

# Dependency Updates

All version numbers live in the `catalog:` section of `pnpm-workspace.yaml` at the repo root. Individual `package.json` files reference them with `catalog:` — never edit version numbers there.

## Process

1. **Check what's outdated** (run from repo root):

   ```bash
   pnpm outdated -r
   ```

2. **Update versions** in `pnpm-workspace.yaml` — all non-pinned packages must have a `^` caret prefix.

3. **Tell the user to refresh the lockfile** — do NOT run this yourself. Instruct the user to run `pnpm refresh:lockfile` from the repo root.

4. **Verify catalog/lockfile are in sync** — after the lockfile is refreshed, run:

   ```bash
   pnpm catalog:check
   ```

   This runs `scripts/checkCatalogMismatches.ts` and exits non-zero if any catalog specifier base differs from its resolved version. Fix any reported mismatches in `pnpm-workspace.yaml` and re-run `pnpm refresh:lockfile` until it passes.

## Pinned packages (do not update)

- **`h3`** — skip major/RC bumps; only update minor/patch within the current major.
- **`@vue/language-core`, `vue-tsc`** — pinned to `3.3.3` (no `^`); 3.3.4 is broken per https://github.com/vuejs/language-tools/issues/6096.

## Overrides (`overrides:` in `pnpm-workspace.yaml`)

Temporary overrides that force a transitive dep to a safe version. Remove when the upstream package catches up. Each override comment must be prefixed with `# @TODO:` so they're easy to search for and clean up later.

## Tracked issues (update normally, but watch these)

- **`oxlint`** — has `^`; open issue https://github.com/oxc-project/oxc/issues/13204.
- **`ajv`, `ajv-errors`, `ajv-formats`, `ajv-i18n`, `debug`** — required by `@koumoul/vjsf`; tracked at https://github.com/json-layout/json-layout/issues/5.
- **`db:run` script** — workaround for https://github.com/drizzle-team/drizzle-orm/issues/1228.

## Caret rules

Every catalog entry must have `^` except pinned packages listed above. If an entry is missing `^` with no entry in the pinned list above, add it when updating.
