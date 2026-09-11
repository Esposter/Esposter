---
name: dependency-updates
description: Esposter dependency update process — all versions in pnpm-workspace.yaml catalog, GitHub Actions dereferenced commit SHAs, caret prefix rules, exact-pinned packages (drizzle-kit/drizzle-orm RCs, and better-auth held at the last version whose sign-in worked — widened only after a real dev-server sign-in, never by a test that stubs the provider), version-capped packages (h3, vuetify, unocss), the deliberate `minimumReleaseAge: 0` that takes a version the day it publishes and what that trades, and tracked open issues — plus deep dives on bumping a GitHub Action to a dereferenced commit SHA, moving the node version with `pnpm update:node`, and the Docker base-image rule keyed on the `docker` datasource that exempts every image tag from the repo-wide `updatePinnedDependencies: false` and pins digests, with Renovate's local dry run showing which deps a rule reaches. Apply when updating package versions.
---

# Dependency Updates

All version numbers live in the `catalog:` section of `pnpm-workspace.yaml` at the repo root. Individual `package.json` files reference them with `catalog:` — never edit version numbers there.

## Process

If the very first `pnpm` command dies inside the app's `postinstall` (`nuxt prepare`, `Cannot find module '@nuxt/devtools-kit'`), that is `node_modules` drift blocking every script, not a lockfile problem: `pnpm i --force`, then `pnpm build:packages`. → `apps/web/content/docs/architecture/monorepo-tooling.md`

1. **Check what's outdated and mismatched** (from repo root): `pnpm outdated:dependencies`
2. **Update versions** in `pnpm-workspace.yaml` — all non-pinned packages need a `^` caret prefix.
3. **Refresh the lockfile**: `pnpm refresh:lockfile` from the repo root. Run it directly — it terminates the node processes holding native `.node` binaries open itself, walking up from its own `$PID` so it never kills the ancestry running it. Every **other** node process is fair game and it does not ask first: other agent sessions, dev servers, editor language servers all go. So confirm nothing else is mid-run before starting it, and expect to restart your own dev server afterwards. On Windows, narrowing the kill to the processes actually holding the binaries would mean handle enumeration through the Restart Manager API — the blanket kill is the deliberate trade, not an oversight.
4. **Verify dependency sync** — after refresh, re-run `pnpm outdated:dependencies`. It checks manifests use `catalog:`/`workspace:`, catalog + configDependency specifiers against lockfile resolutions, and catalog/configDependency/`engines` entries against npm latest. Skip updates per the pinned/tracked-issue notes below; fix mismatches in `pnpm-workspace.yaml` and re-run `pnpm refresh:lockfile` until it passes.

### GitHub Actions are pinned to a dereferenced commit SHA — `references/github-actions.md`

`uses: <owner>/<action>@<commit-sha> # v<version>`, and the SHA is the tag's dereferenced target (`refs/tags/<version>^{}`), never the annotated tag object, which GitHub Actions cannot resolve. **Bumping one** is that page.

`engines` (e.g. `node`) is read from every `package.json` and checked against the matching npm package's latest version (`node` → the `node` npm package). They are not catalog entries — for `node`, never hand-edit it; run `pnpm update:node` (see below).

### Node is never hand-edited — `references/updating-node.md`

`pnpm update:node [version]` from the repo root bumps both node pins together with `@types/node`, installs and defaults the version with fnm, and enables corepack; it does not refresh the lockfile, so `pnpm refresh:lockfile` follows. **Moving the node version**, and the corepack failure a Windows sandbox shows afterwards, is that page.

When `@electric-sql/pglite` changes between minor versions, regenerate the db-mock data directory snapshot from `packages/db-mock/` with `pnpm snapshot:gen`, then verify the db-mock tests. The committed `packages/db-mock/src/snapshot.tar.gz` is tied to PGlite's dump format and may need refreshing even without schema changes.

When `vuetify` or `unocss` changes, `apps/web/uno.config.test.ts` and `apps/web/vuetify.config.test.ts` are the check: they snapshot resolved config, so a failure is the upstream release moving a derived rule, colour or default, and it is the only place that shows. **Read the diff and account for it in the commit before regenerating** — a reflexive `-u` throws away the one signal the bump produces. The `unocss` skill owns the detail.

`inlinedDependencies` in a package manifest is written by tsdown on every build, so a vendored package's bump lands in a reviewed diff — every package included, `apps/functions` among them: it keeps the `main` the Functions host reads through `exports: { legacy: true }` rather than by switching generation off, and generation is the same write that records the list. Nothing there is hand-maintained, so a recorded version that no longer exists under `node_modules/.pnpm` is a build nobody re-ran rather than an edit nobody made — rebuild and read the diff, which is also the explanation on offer for that package's bundle size moving when nothing in its own manifest did.

Any bump that reaches a `dist/` moves the bundle size snapshots. Refresh them per the `testing` skill's `references/platform-and-bundle-tests.md` — rebuild first, then the narrowed `-u` pair — never by editing a snapshot to the number a failure printed.

## Exact-pinned packages (no caret)

- **`drizzle-kit`, `drizzle-orm`** — pinned to an exact RC (no `^`). Leave the caret off: a caret would float them across RC builds. Bump both together, deliberately, to the same version.
- **`better-auth`, `@better-auth/drizzle-adapter`** — pinned exact at 1.7.3, together. 1.7.4 broke sign-in in the running app while CI stayed green end to end — typecheck, every suite, and the Nuxt build — so the break lives in the one thing nothing here exercises: a real OAuth round trip through the browser. A headless test of that path would stub the provider and prove only that better-auth agrees with the stub, which is why none was added. The pin is the enforcer, and Renovate skips it via `updatePinnedDependencies: false`. **Widen back to `^` only after signing in against a dev server on the new version**, bumping both to the same version since the adapter pins its core sibling.
- **`typescript`** — an exact-pinned `npm:typescript-native-bridge@…` alias, so Renovate cannot propose it (`renovate.json` sets `updatePinnedDependencies: false`) and a caret would float it across bridge builds. The alias is what runs `tsc`/`vue-tsc` on the Go compiler (`apps/web/content/docs/architecture/monorepo-tooling.md`); a bump moves the bridge, the TypeScript version behind it and `typescript-eslint` at once, so it is a deliberate, dedicated pass and never part of a routine update.

## Docker base images — `references/renovate-docker.md`

A `packageRules` entry keyed on `matchDatasources: ["docker"]` exempts every image tag from the repo-wide `updatePinnedDependencies: false` and pins digests, so a mutable tag with no comparable version is still tracked. **Editing `renovate.json`, adding a `FROM`, or running Renovate's local dry run to see what a rule reaches** is that page.

## Version-capped packages (keep the caret, cap the range)

- **`h3`** — has `^` (both catalog and `overrides:`). Skip major/RC bumps; only update minor/patch within the current major.
- **`vuetify`** — `~4.1.13`, a tilde rather than a caret. 4.2.0 does not work under `vuetify-nuxt-module`, and no peer range catches it: the module peers `vuetify: ^3.4.0 || ^4.0.0`, so the install resolves happily and breaks at runtime. The block is a **minor**, so a caret would float straight into it — the cap has to narrow the range itself, and a bump is an explicit widening back to `^` once the module ships support. `vuetify.config.test.ts` is where a bad resolution shows.
- **`unocss`, `@unocss/nuxt`, `@unocss/eslint-config`** — `~66.9.2`, tildes, and they move as one trio because every `@unocss/*` package pins its siblings to its own exact version. 66.10.0 rewrote `@unocss/inspector` onto `devframe`, which depends on `h3` 2.x; the `h3` override above holds the tree at 1.x, so `devframe` resolves against a major that has no `H3` export and `nuxt build` dies at the Nitro stage with `The requested module 'h3' does not provide an export named 'H3'`. `@unocss/vite` imports the inspector at the top of its entry, so `inspector: false` does not skip the import and no UnoCSS-side setting avoids it. The block is a **minor**, and the unblock is the `h3` cap lifting — not an UnoCSS release — so re-check it whenever `h3` 2.x becomes takeable, and widen both back together.

## Overrides (`overrides:` in `pnpm-workspace.yaml`)

Temporary overrides that force a transitive dep to a safe version — the block itself is the list. Remove one when the upstream package catches up; most carry no comment explaining why, so check git blame before removing one.

## Release age (`minimumReleaseAge: 0`)

A nonzero `minimumReleaseAge` makes pnpm refuse a version until it has been on the registry for a while — the standard quarantine against installing a compromised release in the window before it is pulled. It is `0` here deliberately: being on the freshest version is the point of the pass, and a quarantine would have `pnpm outdated:dependencies` report updates that `pnpm refresh:lockfile` then declines to take, turning one clean pass into a partial one that has to be run again later for no result the first pass could act on.

What that trades is real and accepted: a just-published bad version installs immediately. The mitigation is the shape of the process rather than a delay — updates here are a deliberate pass someone runs and reads the diff of, not an unattended bot merge, and step 4 re-verifies every resolution before the lockfile is committed. Don't propose raising it.

## Tracked issues (update normally, but watch these)

- **`oxlint`** — has `^`; open issue https://github.com/oxc-project/oxc/issues/13204.
- **`oxlint-tsgolint`** — a bump here is the one thing that could retire the `ignorePatterns` entry covering tsgo's infinite loop on the recursive `three/tsl` types. It ships its own Go binaries, so the `typescript` alias does not move it. Check it on every bump; the exclusion itself, and the CI symptom that does not look like a hang, are documented in the `oxlint` skill's `references/lint-configuration.md`.
- **`ajv`, `ajv-errors`, `ajv-formats`, `ajv-i18n`, `debug`** — required by `@koumoul/vjsf`; tracked at https://github.com/json-layout/json-layout/issues/5.
- **`db:run` script** — workaround for https://github.com/drizzle-team/drizzle-orm/issues/1228.
- **`vitest`, `@vitest/coverage-v8`** — not capped, but they move as a pair: `@vitest/coverage-v8` peers vitest exactly (`5.0.0` peers `vitest: 5.0.0`). A major also waits on `@nuxt/test-utils` peering the new line — it widened to `^4.0.2 || ^5.0.0` for 5, and a 6 would need the same.

## Dependency placement (deps vs peerDeps)

**A `peerDependencies` entry covers everything — keep the dep there and nowhere else.** pnpm's `auto-install-peers` installs peers into the workspace, so they resolve for the package's own build and tests as well as for consumers; a second listing is dead weight that drifts. Which imports have to be peers in the first place is the `build` skill's external-list rule.

## Caret rules

Every catalog entry has `^` except the exact-pinned packages listed above (`drizzle-kit`, `drizzle-orm`, `better-auth` and its adapter, `typescript`) and the two tilde caps, `vuetify` and the `unocss` trio. Note `h3` **has** a caret — it is capped by policy, not by a missing `^`.

Before adding a `^` to a caret-less entry, check it against the exact-pinned list; if it's there, leave it alone. If it isn't, the missing caret is likely an oversight — add it.

**A prerelease keeps its caret.** Alpha/beta/rc/dev catalog entries are carets like everything else — this repo tracks their newest release deliberately, so a suggestion to pin one exactly (because a caret also satisfies the eventual stable, or because a sibling package's `peerDependencies` names one exact prerelease) is rejected, not applied. Drizzle is the standing exception, pinned for the reason given above, not a precedent to extend.
