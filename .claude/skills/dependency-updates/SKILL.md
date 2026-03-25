---
name: dependency-updates
description: Esposter dependency update process — all versions in pnpm-workspace.yaml catalog, caret prefix rules, pinned packages (nuxt, h3, ctix), and tracked open issues. Apply when updating package versions.
---

# Dependency Updates

All version numbers live in the `catalog:` section of `pnpm-workspace.yaml` at the repo root. Individual `package.json` files reference them with `catalog:` — never edit version numbers there.

## Process

1. **Check what's outdated** (run from repo root):

   ```
   pnpm outdated -r
   ```

2. **Update versions** in `pnpm-workspace.yaml` — all non-pinned packages must have a `^` caret prefix.

3. **Tell the user to refresh the lockfile** — do NOT run this yourself. Instruct the user to run `pnpm refresh:lockfile` from the repo root.

## Pinned packages (do not update)

- **`nuxt`** — no `^`, manually managed (infrastructure, coordinates with `h3` and Nuxt modules).
- **`h3`** — skip major/RC bumps; only update minor/patch within the current major.
- **`ctix`** — pinned (no `^`) due to open issue https://github.com/imjuni/ctix/issues/192.
- **`typescript`** — skip; user manages manually (major version bumps need explicit review).
- **`@typescript/native-preview`** — skip; user manages manually (dev preview channel, updated on demand).

## Tracked issues (update normally, but watch these)

- **`oxlint`** — has `^`; open issue https://github.com/oxc-project/oxc/issues/13204.
- **`ajv`, `ajv-errors`, `ajv-formats`, `ajv-i18n`, `debug`** — required by `@koumoul/vjsf`; tracked at https://github.com/json-layout/json-layout/issues/5.
- **`db:run` script** — workaround for https://github.com/drizzle-team/drizzle-orm/issues/1228.

## Caret rules

Every catalog entry must have `^` except pinned packages listed above. If an entry is missing `^` with no entry in the pinned list above, add it when updating.
