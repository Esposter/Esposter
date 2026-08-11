---
name: dependency-updates
description: Esposter dependency update process — all versions in pnpm-workspace.yaml catalog, GitHub Actions dereferenced commit SHAs, caret prefix rules, exact-pinned packages (drizzle-kit/drizzle-orm RCs), version-capped packages (h3), and tracked open issues. Apply when updating package versions.
---

# Dependency Updates

All version numbers live in the `catalog:` section of `pnpm-workspace.yaml` at the repo root. Individual `package.json` files reference them with `catalog:` — never edit version numbers there.

## Process

If the very first `pnpm` command dies inside the app's `postinstall` (`nuxt prepare`, `Cannot find module '@nuxt/devtools-kit'`), that is `node_modules` drift blocking every script, not a lockfile problem: `pnpm i --force`, then `pnpm build:packages`. → [monorepo tooling](https://github.com/Esposter/Esposter/blob/main/packages/app/content/docs/architecture/monorepo-tooling.md)

1. **Check what's outdated and mismatched** (from repo root): `pnpm outdated:dependencies`
2. **Update versions** in `pnpm-workspace.yaml` — all non-pinned packages need a `^` caret prefix.
3. **Refresh the lockfile**: `pnpm refresh:lockfile` from the repo root. Run it directly — it terminates the node processes holding native `.node` binaries open itself, walking up from its own `$PID` so it never kills the ancestry running it. Every **other** node process is fair game and it does not ask first: other agent sessions, dev servers, editor language servers all go. So confirm nothing else is mid-run before starting it, and expect to restart your own dev server afterwards. On Windows, narrowing the kill to the processes actually holding the binaries would mean handle enumeration through the Restart Manager API — the blanket kill is the deliberate trade, not an oversight.
4. **Verify dependency sync** — after refresh, re-run `pnpm outdated:dependencies`. It checks manifests use `catalog:`/`workspace:`, catalog + configDependency specifiers against lockfile resolutions, and catalog/configDependency/`engines` entries against npm latest. Skip updates per the pinned/tracked-issue notes below; fix mismatches in `pnpm-workspace.yaml` and re-run `pnpm refresh:lockfile` until it passes.

### Updating GitHub Actions (Resolving Commit SHAs)

GitHub Actions steps in `.github/workflows/` and `.github/actions/` are pinned to 40-character commit SHAs followed by a version comment (e.g., `uses: <owner>/<action>@<commit-sha> # v<version>`).

When updating a GitHub Action to a new release tag:

1. Fetch tags from the remote repo:
   ```bash
   git ls-remote --tags https://github.com/<owner>/<repo>.git "refs/tags/<version>*"
   ```
2. **Dereference annotated tags**:
   - Annotated tags produce two output lines: `refs/tags/<version>` (the Git tag object SHA) and `refs/tags/<version>^{}` (the dereferenced target commit SHA).
   - **Always use the dereferenced commit SHA (`refs/tags/<version>^{}`)**. Using the tag object SHA will fail to resolve in GitHub Actions.
   - If the tag is lightweight (unannotated), only `refs/tags/<version>` is returned; use that SHA.

`engines` (e.g. `node`) is read from every `package.json` and checked against the matching npm package's latest version (`node` → the `node` npm package). They are not catalog entries — for `node`, never hand-edit it; run `pnpm update:node` (see below).

### Updating node

Don't hand-edit the node version — run `pnpm update:node [version]` from the repo root. With no argument it targets the latest stable node from the npm registry. In one call it:

1. Bumps `engines.node` in root `package.json` (CI reads this via `node-version-file: package.json`, so it's the single source of truth)
2. Bumps the `@types/node` catalog entry to the highest release matching the new node major
3. Installs the new version with fnm and sets it as the default (`fnm install`/`default`) — `fnm default` persists for every new shell. It deliberately does not run `fnm use`: the script runs in a nested non-interactive shell, so a `use` would only mutate a PATH that dies with the script
4. Enables corepack on the new version (a freshly installed node ships it disabled, so `pnpm` would otherwise be missing)
5. Schedules removal of the old version — fnm can't delete a node version while it's in use, so a detached process retries `fnm uninstall <old>` until this call's node processes exit, then removes it (self-cleaning, no process killing)

The TS orchestration (`scripts/updateNode/`) resolves versions and edits the manifests; the per-OS `install.ps1`/`install.sh` (dispatched via `crossOS`, like `refresh:lockfile`) do the fnm work. Pure helpers (version selection, manifest editing) live beside them with unit tests; the generic registry/version utilities are shared from `scripts/services/`.

It deliberately does **not** refresh the lockfile. After it finishes, run `pnpm refresh:lockfile` to resolve the new `@types/node`. Already-open shells keep the old version until reopened.

When `@electric-sql/pglite` changes between minor versions, regenerate the db-mock data directory snapshot from `packages/db-mock/` with `pnpm snapshot:gen`, then verify the db-mock tests. The committed `packages/db-mock/src/snapshot.tar.gz` is tied to PGlite's dump format and may need refreshing even without schema changes.

## Exact-pinned packages (no caret)

- **`drizzle-kit`, `drizzle-orm`** — pinned to an exact RC (no `^`). Leave the caret off: a caret would float them across RC builds. Bump both together, deliberately, to the same version.
- **`typescript`** — pinned exact so Renovate cannot propose it (`renovate.json` sets `updatePinnedDependencies: false`). A TypeScript major ripples through `vue-tsc`, `typescript-eslint`, `oxlint-tsgolint`, and `@typescript/native-preview` at once, so it moves only as a deliberate, dedicated pass. Unpin (restore the `^`) only for the duration of that pass.

## Version-capped packages (keep the caret, cap the range)

- **`h3`** — has `^` (both catalog and `overrides:`). Skip major/RC bumps; only update minor/patch within the current major.

## Overrides (`overrides:` in `pnpm-workspace.yaml`)

Temporary overrides that force a transitive dep to a safe version (currently `crossws`, `h3`, `pdfjs-dist`, `vite`). Remove when the upstream package catches up — most carry no comment explaining why, so check git blame before removing one.

## Tracked issues (update normally, but watch these)

- **`oxlint`** — has `^`; open issue https://github.com/oxc-project/oxc/issues/13204.
- **`oxlint-tsgolint` / `@typescript/native-preview`** — a bump here is the one thing that could retire the `ignorePatterns` entry covering tsgo's infinite loop on the recursive `three/tsl` types. Check it on every bump; the exclusion itself, and the CI symptom that does not look like a hang, are the `oxlint` skill's (`references/lint-configuration.md`).
- **`ajv`, `ajv-errors`, `ajv-formats`, `ajv-i18n`, `debug`** — required by `@koumoul/vjsf`; tracked at https://github.com/json-layout/json-layout/issues/5.
- **`db:run` script** — workaround for https://github.com/drizzle-team/drizzle-orm/issues/1228.

## Dependency placement (deps vs peerDeps)

**A `peerDependencies` entry covers everything — keep the dep there and nowhere else.** pnpm's `auto-install-peers` installs peers into the workspace, so they resolve for the package's own build and tests as well as for consumers; a second listing is dead weight that drifts. Which imports have to be peers in the first place is the `build` skill's external-list rule.

## Caret rules

Every catalog entry has `^` except the exact-pinned packages listed above (`drizzle-kit`, `drizzle-orm`, `typescript`). Note `h3` **has** a caret — it is capped by policy, not by a missing `^`.

Before adding a `^` to a caret-less entry, check it against the exact-pinned list; if it's there, leave it alone. If it isn't, the missing caret is likely an oversight — add it.

**A prerelease keeps its caret.** Alpha/beta/rc/dev catalog entries are carets like everything else — this repo tracks their newest release deliberately, so a suggestion to pin one exactly (because a caret also satisfies the eventual stable, or because a sibling package's `peerDependencies` names one exact prerelease) is rejected, not applied. Drizzle is the standing exception, pinned for the reason given above, not a precedent to extend.
