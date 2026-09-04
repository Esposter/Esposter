---
name: dependency-updates
description: Esposter dependency update process — all versions in pnpm-workspace.yaml catalog, GitHub Actions dereferenced commit SHAs, caret prefix rules, exact-pinned packages (drizzle-kit/drizzle-orm RCs), version-capped packages (h3, vitest, vuetify), the deliberate `minimumReleaseAge: 0` that takes a version the day it publishes and what that trades, and tracked open issues. Apply when updating package versions.
---

# Dependency Updates

All version numbers live in the `catalog:` section of `pnpm-workspace.yaml` at the repo root. Individual `package.json` files reference them with `catalog:` — never edit version numbers there.

## Process

If the very first `pnpm` command dies inside the app's `postinstall` (`nuxt prepare`, `Cannot find module '@nuxt/devtools-kit'`), that is `node_modules` drift blocking every script, not a lockfile problem: `pnpm i --force`, then `pnpm build:packages`. → `packages/app/content/docs/architecture/monorepo-tooling.md`

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

1. Bumps both node pins in root `package.json` together — `devEngines.runtime` (what `pnpm/setup` installs on the runners) and `engines.node` (what every other tool reads). They are the same number by definition; never write one alone
2. Bumps the `@types/node` catalog entry to the highest release matching the new node major
3. Installs the new version with fnm and sets it as the default (`fnm install`/`default`) — `fnm default` persists for every new shell. It deliberately does not run `fnm use`: the script runs in a nested non-interactive shell, so a `use` would only mutate a PATH that dies with the script
4. Enables corepack on the new version (a freshly installed node ships it disabled, so `pnpm` would otherwise be missing)
5. Schedules removal of the old version — fnm can't delete a node version while it's in use, so a detached process retries `fnm uninstall <old>` until this call's node processes exit, then removes it (self-cleaning, no process killing)

The TS orchestration (`scripts/updateNode/`) resolves versions and edits the manifests; the per-OS `install.ps1`/`install.sh` (dispatched via `crossOS`, like `refresh:lockfile`) do the fnm work. Pure helpers (version selection, manifest editing) live beside them with unit tests; the generic registry/version utilities are shared from `scripts/services/`.

It deliberately does **not** refresh the lockfile. After it finishes, run `pnpm refresh:lockfile` to resolve the new `@types/node`. Already-open shells keep the old version until reopened.

When `@electric-sql/pglite` changes between minor versions, regenerate the db-mock data directory snapshot from `packages/db-mock/` with `pnpm snapshot:gen`, then verify the db-mock tests. The committed `packages/db-mock/src/snapshot.tar.gz` is tied to PGlite's dump format and may need refreshing even without schema changes.

When `vuetify` or `unocss` changes, `packages/app/uno.config.test.ts` and `packages/app/vuetify.config.test.ts` are the check: they snapshot resolved config, so a failure is the upstream release moving a derived rule, colour or default, and it is the only place that shows. **Read the diff and account for it in the commit before regenerating** — a reflexive `-u` throws away the one signal the bump produces. The `unocss` skill owns the detail.

`inlinedDependencies` in a package manifest is written by tsdown on every build, so a vendored package's bump lands in a reviewed diff — every package included, `packages/azure-functions` among them: it keeps the `main` the Functions host reads through `exports: { legacy: true }` rather than by switching generation off, and generation is the same write that records the list. Nothing there is hand-maintained, so a recorded version that no longer exists under `node_modules/.pnpm` is a build nobody re-ran rather than an edit nobody made — rebuild and read the diff, which is also the explanation on offer for that package's bundle size moving when nothing in its own manifest did.

Any bump that reaches a `dist/` moves the bundle size snapshots. Refresh them per the `testing` skill's `references/platform-and-bundle-tests.md` — rebuild first, then the narrowed `-u` pair — never by editing a snapshot to the number a failure printed.

## Exact-pinned packages (no caret)

- **`drizzle-kit`, `drizzle-orm`** — pinned to an exact RC (no `^`). Leave the caret off: a caret would float them across RC builds. Bump both together, deliberately, to the same version.
- **`typescript`** — an exact-pinned `npm:typescript-native-bridge@…` alias, so Renovate cannot propose it (`renovate.json` sets `updatePinnedDependencies: false`) and a caret would float it across bridge builds. The alias is what runs `tsc`/`vue-tsc` on the Go compiler (`packages/app/content/docs/architecture/monorepo-tooling.md`); a bump moves the bridge, the TypeScript version behind it and `typescript-eslint` at once, so it is a deliberate, dedicated pass and never part of a routine update.

## Version-capped packages (keep the caret, cap the range)

- **`h3`** — has `^` (both catalog and `overrides:`). Skip major/RC bumps; only update minor/patch within the current major.
- **`vitest`, `@vitest/coverage-v8`** — have `^`, so the major cap is already the caret's. `@nuxt/test-utils` peers `vitest: ^4.0.2`; until it widens to 5, the 5.x line is unreachable however deliberate the pass. `@vitest/coverage-v8` peers vitest exactly (`5.0.0` peers `vitest: 5.0.0`), so the two move together or not at all.
- **`vuetify`** — `~4.1.13`, the one catalog entry whose range is a tilde. 4.2.0 does not work under `vuetify-nuxt-module`, and no peer range catches it: the module peers `vuetify: ^3.4.0 || ^4.0.0`, so the install resolves happily and breaks at runtime. The block is a **minor**, so a caret would float straight into it — the cap has to narrow the range itself, and a bump is an explicit widening back to `^` once the module ships support. `vuetify.config.test.ts` is where a bad resolution shows.

## Overrides (`overrides:` in `pnpm-workspace.yaml`)

Temporary overrides that force a transitive dep to a safe version — the block itself is the list. Remove one when the upstream package catches up; most carry no comment explaining why, so check git blame before removing one.

## Release age (`minimumReleaseAge: 0`)

A nonzero `minimumReleaseAge` makes pnpm refuse a version until it has been on the registry for a while — the standard quarantine against installing a compromised release in the window before it is pulled. It is `0` here deliberately: being on the freshest version is the point of the pass, and a quarantine would have `pnpm outdated:dependencies` report updates that `pnpm refresh:lockfile` then declines to take, turning one clean pass into a partial one that has to be run again later for no result the first pass could act on.

What that trades is real and accepted: a just-published bad version installs immediately. The mitigation is the shape of the process rather than a delay — updates here are a deliberate pass someone runs and reads the diff of, not an unattended bot merge, and step 4 re-verifies every resolution before the lockfile is committed. Don't propose raising it.

## Tracked issues (update normally, but watch these)

- **`oxlint`** — has `^`; open issue https://github.com/oxc-project/oxc/issues/13204.
- **`oxlint-tsgolint`** — a bump here is the one thing that could retire the `ignorePatterns` entry covering tsgo's infinite loop on the recursive `three/tsl` types. It ships its own Go binaries, so the `typescript` alias does not move it. Check it on every bump; the exclusion itself, and the CI symptom that does not look like a hang, are documented in the `oxlint` skill's `references/lint-configuration.md`.
- **`ajv`, `ajv-errors`, `ajv-formats`, `ajv-i18n`, `debug`** — required by `@koumoul/vjsf`; tracked at https://github.com/json-layout/json-layout/issues/5.
- **`vitest`** — capped above, so the 5.0.0 the outdated table keeps offering is not takeable yet. What is waiting on it: 5.0.0 retires the `Temporal.Now` fake-timer workaround (https://github.com/vitest-dev/vitest/issues/10345, closed against that milestone as a breaking change), and nothing on 4.x fakes `Temporal`, so the workaround stays as long as the cap does. When `@nuxt/test-utils` widens its peer, take the bump as its own deliberate pass — it is a major — and drop the workaround in it. That row, its probe, and every other shim a bump can retire live in `packages/app/content/docs/proposals/refactors/test-harness-workarounds.md`.
- **`db:run` script** — workaround for https://github.com/drizzle-team/drizzle-orm/issues/1228.

## Dependency placement (deps vs peerDeps)

**A `peerDependencies` entry covers everything — keep the dep there and nowhere else.** pnpm's `auto-install-peers` installs peers into the workspace, so they resolve for the package's own build and tests as well as for consumers; a second listing is dead weight that drifts. Which imports have to be peers in the first place is the `build` skill's external-list rule.

## Caret rules

Every catalog entry has `^` except the exact-pinned packages listed above (`drizzle-kit`, `drizzle-orm`, `typescript`) and `vuetify`, whose cap is a tilde. Note `h3` and `vitest` **have** carets — they are capped by policy, not by a missing `^`.

Before adding a `^` to a caret-less entry, check it against the exact-pinned list; if it's there, leave it alone. If it isn't, the missing caret is likely an oversight — add it.

**A prerelease keeps its caret.** Alpha/beta/rc/dev catalog entries are carets like everything else — this repo tracks their newest release deliberately, so a suggestion to pin one exactly (because a caret also satisfies the eventual stable, or because a sibling package's `peerDependencies` names one exact prerelease) is rejected, not applied. Drizzle is the standing exception, pinned for the reason given above, not a precedent to extend.
