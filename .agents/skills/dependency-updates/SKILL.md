---
name: dependency-updates
description: Apply when updating package versions, bumping a GitHub Action or the node version, or editing renovate.json. Esposter dependency update process — Renovate as the writer of every version and renovate.json packageRules as the one statement of which dependency is held and why, every catalog entry with a caret unless a rule says otherwise, actions pinned to a dereferenced commit SHA, node moved by the node group or pnpm update:node, minimumReleaseAge kept at 0, and the tracked issues a bump watches.
---

# Dependency Updates

All version numbers live in the `catalog:` section of `pnpm-workspace.yaml` at the repo root. Individual `package.json` files reference them with `catalog:` — never edit version numbers there.

**Renovate writes versions; people write policy.** Every version the repo declares is reached by Renovate — the catalog and `overrides:`, `engines.node` and `devEngines.runtime`, `packageManager`, every action under `.github/`, every `FROM` — and a minor or patch merges on green without a person in the loop, a major waits for one. What a person owns is `renovate.json`'s `packageRules`: a dependency held below a version, disabled, grouped or read before merging is one rule there with a `description` that is the reason, and **`pnpm outdated:dependencies` reads the same rules**, so a version the bot would not propose is listed as held rather than as a bump to take. Policy written anywhere else — a range trick in the catalog, a note in this skill alone — is policy the bot cannot read, which is how the unocss tilde churned a branch every run. Which rules exist and what each manager reaches is `references/renovate.md`.

## Bumping by hand

A bump ahead of the bot follows the same path Renovate takes, from the repo root:

If the very first `pnpm` command dies inside the app's `postinstall` (`nuxt prepare`, `Cannot find module '@nuxt/devtools-kit'`), that is `node_modules` drift blocking every script, not a lockfile problem: `pnpm i --force`, then `pnpm build:packages`. → `apps/web/content/docs/architecture/monorepo-tooling.md`

1. **Check what's outdated and mismatched**: `pnpm outdated:dependencies`. It checks manifests use `catalog:`/`workspace:`, catalog + configDependency specifiers against lockfile resolutions, and catalog/configDependency/`engines` entries against npm latest, then lists apart what a `renovate.json` rule holds. A held row is not taken; changing that is a rule edit, not a bump.
2. **Update versions** in `pnpm-workspace.yaml` — every entry keeps its `^` unless a rule below says otherwise.
3. **Refresh the lockfile**: `pnpm refresh:lockfile`. Run it directly — it terminates the node processes holding native `.node` binaries open itself, walking up from its own `$PID` so it never kills the ancestry running it. Every **other** node process is fair game and it does not ask first: other agent sessions, dev servers, editor language servers all go. So confirm nothing else is mid-run before starting it, and expect to restart your own dev server afterwards. On Windows, narrowing the kill to the processes actually holding the binaries would mean handle enumeration through the Restart Manager API — the blanket kill is the deliberate trade, not an oversight.
4. **Verify dependency sync** — re-run `pnpm outdated:dependencies`; fix mismatches in `pnpm-workspace.yaml` and re-run `pnpm refresh:lockfile` until it passes.

### GitHub Actions are pinned to a dereferenced commit SHA — `references/github-actions.md`

`uses: <owner>/<action>@<commit-sha> # v<version>`, and the SHA is the tag's dereferenced target (`refs/tags/<version>^{}`), never the annotated tag object, which GitHub Actions cannot resolve. Renovate keeps them (`helpers:pinGitHubActionDigests`); **bumping one by hand** is that page.

### Node moves as one group — `references/updating-node.md`

`engines.node`, `devEngines.runtime` and `@types/node` are one version, so Renovate's `node` group moves the three in one branch, and `pnpm update:node [version]` from the repo root is the same write by hand plus the machine's side — installing and defaulting the version with fnm and enabling corepack — which is why it is also the command to run after pulling a merged node bump. Neither pin is ever hand-edited. **Moving the node version**, and the corepack failure a Windows sandbox shows afterwards, is that page.

## What a bump owes beyond the version

When `@electric-sql/pglite` changes between minor versions, regenerate the db-mock data directory snapshot from `packages/db-mock/` with `pnpm snapshot:gen`, then verify the db-mock tests. The committed `packages/db-mock/src/snapshot.tar.gz` is tied to PGlite's dump format and may need refreshing even without schema changes.

When `vuetify` or `unocss` changes, `apps/web/uno.config.test.ts` and `apps/web/vuetify.config.test.ts` are the check: they snapshot resolved config, so a failure is the upstream release moving a derived rule, colour or default, and it is the only place that shows. **Read the diff and account for it in the commit before regenerating** — a reflexive `-u` throws away the one signal the bump produces. The `unocss` skill owns the detail.

`inlinedDependencies` in a package manifest is written by tsdown on every build, so a vendored package's bump lands in a reviewed diff — every package included, `apps/functions` among them: it keeps the `main` the Functions host reads through `exports: { legacy: true }` rather than by switching generation off, and generation is the same write that records the list. Nothing there is hand-maintained, so a recorded version that no longer exists under `node_modules/.pnpm` is a build nobody re-ran rather than an edit nobody made — rebuild and read the diff, which is also the explanation on offer for that package's bundle size moving when nothing in its own manifest did.

Any bump that reaches a `dist/` moves the bundle size snapshots. Refresh them per the `testing` skill's `references/platform-and-bundle-tests.md` — rebuild first, then the narrowed `-u` pair — never by editing a snapshot to the number a failure printed.

## Holding a dependency

A hold is a `packageRules` entry naming the packages exactly (`matchPackageNames`; the report throws on a glob or regex, because it matches names and nothing else) and carrying the reason as its `description`. The catalog range beside it says what **pnpm** may resolve, and the two are one cap in two dialects:

- **A cap at a major needs only the rule** — the caret already stops a re-resolve. `h3` is `^1.15.11` in the catalog and `overrides:` with `allowedVersions: "<2"`; 2.x has no `H3` export where Nitro imports one. Only minor/patch within the major.
- **A cap inside a major needs the rule and a tilde** — a caret would float `pnpm refresh:lockfile` straight into it. `unocss`, `@unocss/nuxt`, `@unocss/eslint-config` are `~66.9.2` with `allowedVersions: "<66.10"`, and they move as one because every `@unocss/*` pins its siblings to its own exact version. The minor after the cap rewrote `@unocss/inspector` onto `devframe`, which depends on `h3` 2.x, so under the `h3` cap `nuxt build` dies at the Nitro stage (`The requested module 'h3' does not provide an export named 'H3'`); `@unocss/vite` imports the inspector at the top of its entry, so no UnoCSS setting avoids it. The unblock is the `h3` cap lifting, not an UnoCSS release — re-check whenever `h3` 2.x becomes takeable, and widen the rule and the tilde back together.
- **A dedicated pass is `enabled: false`** — `typescript` is exact-pinned in the catalog and aliased to `npm:typescript-native-bridge@…` under `overrides:`, the alias being what runs `tsc`/`vue-tsc` on the Go compiler (`apps/web/content/docs/architecture/monorepo-tooling.md`). A bump moves the bridge, the TypeScript behind it and `typescript-eslint` at once, so the rule names both `typescript` and `typescript-native-bridge` (a rule matches the resolved package) and the pass is run deliberately, never as part of a routine update.
- **An exact pin on a prerelease line is `followTag`** — `drizzle-kit`, `drizzle-orm` are pinned to one RC (no `^`: a caret would float them across the per-commit builds drizzle publishes under a dist-tag per branch) and follow the `rc` tag, grouped and `automerge: false` because a release candidate can change what `db:gen` emits. Drop `followTag` once 1.0.0 reaches `latest`.

## Overrides (`overrides:` in `pnpm-workspace.yaml`)

Temporary overrides that force a transitive dep to a safe version — the block itself is the list. Renovate reaches them like catalog entries. Remove one when the upstream package catches up; most carry no comment explaining why, so check git blame before removing one.

## Release age (`minimumReleaseAge: 0`)

A nonzero `minimumReleaseAge` makes pnpm refuse a version until it has been on the registry for a while — the standard quarantine against installing a compromised release in the window before it is pulled. It is `0` here deliberately, and Renovate's own `minimumReleaseAge` is unset for the same reason: being on the freshest version is the point, and a quarantine would have `pnpm outdated:dependencies` report updates that `pnpm refresh:lockfile` then declines to take, turning one clean pass into a partial one that has to be run again later for no result the first pass could act on.

What that trades is real and accepted: a just-published bad version installs immediately, and a minor or patch then merges to `main` on green with no person reading it. CI on the automerge branch is the whole gate, not a delay. Don't propose raising either.

## Tracked issues (update normally, but watch these)

- **`oxlint`** — has `^`; open issue https://github.com/oxc-project/oxc/issues/13204.
- **`oxlint-tsgolint`** — a bump here is the one thing that could retire the `ignorePatterns` entry covering tsgo's infinite loop on the recursive `three/tsl` types. It ships its own Go binaries, so the `typescript` alias does not move it. Check it on every bump; the exclusion itself, and the CI symptom that does not look like a hang, are documented in the `oxlint` skill's `references/lint-configuration.md`.
- **`ajv`, `ajv-errors`, `ajv-formats`, `ajv-i18n`, `debug`** — required by `@koumoul/vjsf`; tracked at https://github.com/json-layout/json-layout/issues/5.
- **`db:run` script** — workaround for https://github.com/drizzle-team/drizzle-orm/issues/1228.
- **`vitest`, `@vitest/coverage-v8`** — Renovate's vitest monorepo group moves them as the pair they are (`@vitest/coverage-v8` peers vitest at the exact version). A major also waits on `@nuxt/test-utils` peering the new line — it widens its `vitest` peer one major at a time, and the next major needs the same; no rule encodes that, because the peer conflict fails the install in the branch and a major is never automerged.

## Dependency placement (deps vs peerDeps)

**A `peerDependencies` entry covers everything — keep the dep there and nowhere else.** pnpm's `auto-install-peers` installs peers into the workspace, so they resolve for the package's own build and tests as well as for consumers; a second listing is dead weight that drifts. Which imports have to be peers in the first place is the `build` skill's external-list rule.

## Caret rules

Every catalog entry has `^` except what a rule above explains: the exact pins (`drizzle-kit`, `drizzle-orm`, `typescript`) and the one tilde, the unocss trio. `h3` **has** a caret — it is capped by a rule, not by a missing `^`. A tilde is what a cap on a **minor** looks like in the catalog, and it never stands alone: the rule is what stops the bot, the tilde what stops a re-resolve.

Before adding a `^` to a caret-less entry, check it against the exact pins; if it's there, leave it alone. If it isn't, the missing caret is likely an oversight — add it.

**A prerelease keeps its caret.** Alpha/beta/rc/dev catalog entries are carets like everything else — this repo tracks their newest release deliberately, so a suggestion to pin one exactly (because a caret also satisfies the eventual stable, or because a sibling package's `peerDependencies` names one exact prerelease) is rejected, not applied. Drizzle is the standing exception, pinned for the reason given above, not a precedent to extend.
