---
name: dependency-updates
description: Apply when updating package versions, taking a major, bumping a GitHub Action or the node version, or editing renovate.json. Esposter dependency update process — a Settled list (no confirmation gate before the lockfile refresh, one commit per hand pass), Renovate as the writer of every version and renovate.json packageRules as the one statement of which dependency is held and why, every catalog entry with a caret unless a rule says otherwise, a major owing a release-note audit whose record is the commit body, actions pinned to a dereferenced commit SHA, node moved by the node group or pnpm update:node, minimumReleaseAge kept at 0, and the tracked issues a bump watches.
---

# Dependency Updates

All version numbers live in the `catalog:` section of `pnpm-workspace.yaml` at the repo root. Individual `package.json` files reference them with `catalog:` — never edit version numbers there.

**Renovate writes versions; people write policy.** Every version the repo declares is reached by Renovate — the catalog and `overrides:`, `.node-version`, `packageManager`, every action under `.github/`, every `FROM` — and a minor or patch merges on green without a person in the loop, a major — or any pnpm bump — waits for one. The one version outside the bot is the Functions host's node major in `apps/infra`, capped by what the runtime supports and moved by hand (`pulumi-infra`). What a person owns is `renovate.json`'s `packageRules`: every cap, disable, group and read-before-merge is one rule there with a `description` that is the reason, and **`pnpm outdated:dependencies` reads the same rules**, so a version the bot would not propose is listed as held rather than as a bump to take. Policy written anywhere else — a range trick in the catalog, a note in this skill alone — is policy the bot cannot read, which is how the unocss tilde churned a branch every run. Which rules exist and what each manager reaches is `references/renovate.md`.

## Settled — do not re-propose

- **A confirmation gate before `pnpm refresh:lockfile`** (step 3 below). Its process kill is the precondition the delete needs on Windows, everything it ends is a restartable process of this repo's own, and a pass runs unattended — a gate turns it into one that stops to ask a question whose answer is yes. The trade is written at step 3, and a review finding asking for the gate is answered with this line (`coderabbit`).
- **Splitting a hand pass into one commit per major.** A pass is one commit whose body carries a section per major; the split bought a per-package revert this repo never performs and cost a hand-reconciled lockfile per commit (`references/major-upgrades.md` §5).

## Bumping by hand

A bump ahead of the bot follows the same path Renovate takes, from the repo root:

If the very first `pnpm` command dies inside the app's `postinstall` (`nuxt prepare`, `Cannot find module '@nuxt/devtools-kit'`), that is `node_modules` drift blocking every script, not a lockfile problem: `pnpm i --force`, then `pnpm build:packages`. → `apps/web/content/docs/architecture/monorepo-tooling.md`

1. **Check what's outdated and mismatched**: `pnpm outdated:dependencies`. It checks manifests use `catalog:`/`workspace:`, catalog + configDependency specifiers against lockfile resolutions, and catalog/configDependency/`engines` entries against npm latest, then lists apart what a `renovate.json` rule holds. A held row is not taken; changing that is a rule edit, not a bump. A manifest with a `package-lock.json` beside it — the plugin's, and the runtime manifest under it — is npm's rather than the catalog's: its plain ranges are checked against that lockfile and the registry as the `npm` group, attributed to the manifest by name, and the same package's pnpm row drops that dependent so nothing is listed twice.
2. **Update versions** in `pnpm-workspace.yaml` — every entry keeps its `^` unless a rule below says otherwise.
3. **Refresh the lockfile**: `pnpm refresh:lockfile`. It deletes `pnpm-lock.yaml` and every `node_modules` in the tree and installs from nothing, which is what it is for and why it costs minutes rather than seconds. Run it directly — on Windows a running process holds open the native `.node` binaries the delete is about to remove, so it terminates node processes first, and the filter is two-sided: only those whose command line names **this workspace** (a neighbouring checkout and the machine's unrelated editors survive, and the path boundary is why the match carries a trailing separator), minus its own ancestry, walking up from its `$PID` so it never kills the run. Anything of this repo's that is mid-run does go without asking — another session's vitest, a dev server, the editor servers rooted here — and every one of them restarts from where it was, so the run asks nobody first (Settled) and the one thing to expect is restarting your own dev server afterwards. Narrowing the kill to the processes actually holding the binaries would mean handle enumeration through the Restart Manager API — the workspace-wide kill is the deliberate trade, not an oversight.

   The refresh is what the pass commits: the lockfile it writes is the one `node_modules` was verified against, and `pnpm install --lockfile-only` resolves the same versions under different peer-suffix keys, so it is a probe for what a catalog edit would resolve to and never the lockfile a commit carries.

4. **Verify dependency sync** — re-run `pnpm outdated:dependencies`; fix mismatches in `pnpm-workspace.yaml` and re-run `pnpm refresh:lockfile` until it passes. A mismatch in the `npm` group is the manifest's own range against its `package-lock.json`, which the refresh never touches: that lockfile is regenerated the way the `file-organization` skill's plugin page says, from a clean copy of the manifest.

### A major is a version write plus an audit — `references/major-upgrades.md`

A minor or patch is steps 1–4 plus what a bump owes beyond the version, below. A **major** — a red row in `pnpm outdated:dependencies`, or the PR Renovate opens because it never automerges one — additionally owes an audit whose record is the commit body: the release notes read from the tag with `gh release view` rather than from a summary of them, every breaking bullet answered by a grep that excludes the generated trees, every release in between read when more than one major is crossed, and the **features** list weighed against what this repo hand-rolled in its absence — a major is when that debt is cheapest to shed, so the migration lands in the same commit as the bump and a rejected one is rejected in writing. Doing all of that is that page.

### pnpm is read at every minor, not only a major

pnpm ships its new workspace settings in minors — `autoDedupe` arrived in 12.6 — and a setting worth turning on shows up in the release notes and never in a green check. So a pnpm bump owes the **features half** of the major audit whatever its size: every release it crosses read from the tag (`gh release list -R pnpm/pnpm`, then `gh release view v<version> -R pnpm/pnpm`), each new setting weighed against `pnpm-workspace.yaml` and `renovate.json`, and the ones taken landing in the same commit as the `packageManager` bump, a declined one declined in its body. `renovate.json`'s `pnpm` rule turns off automerge so the bot's branch waits as a PR for that read, and `pnpm outdated:dependencies` lists `packageManager` as a row of its own. A setting that takes over something another tool was doing retires the other one in the same change — `autoDedupe` replaced the dedupe step Renovate used to run after each update.

### GitHub Actions are pinned to a dereferenced commit SHA — `references/github-actions.md`

`uses: <owner>/<action>@<commit-sha> # v<version>`, and the SHA is the tag's dereferenced target (`refs/tags/<version>^{}`), never the annotated tag object, which GitHub Actions cannot resolve. Renovate keeps them (`helpers:pinGitHubActionDigests`); **bumping one by hand** is that page.

### Node is one pin — `references/updating-node.md`

`.node-version` is the one node pin — no `engines.node` or `devEngines.runtime` beside it, bar the persona plugin's feature floor (`file-organization`, `references/new-package.md`) — and `@types/node` follows its major, so Renovate's `node` group moves the two in one branch, and `pnpm update:node [version]` from the repo root is the same write by hand plus the machine's side — installing and defaulting the version with fnm and enabling corepack — which is why it is also the command to run after pulling a merged node bump. The pin is never hand-edited. **Moving the node version**, and the corepack failure a Windows sandbox shows afterwards, is that page.

## What a bump owes beyond the version

When `@electric-sql/pglite` changes between minor versions, regenerate the db-mock data directory snapshot from `packages/db-mock/` with `pnpm snapshot:gen`, then verify the db-mock tests. The committed `packages/db-mock/src/snapshot.tar.gz` is tied to PGlite's dump format and may need refreshing even without schema changes.

When `vuetify` or `unocss` changes, `apps/web/uno.config.test.ts` and `apps/web/vuetify.config.test.ts` are the check: they snapshot resolved config, so a failure is the upstream release moving a derived rule, colour or default, and it is the only place that shows. **Read the diff and account for it in the commit before regenerating** — a reflexive `-u` throws away the one signal the bump produces. The `unocss` skill owns the detail.

`inlinedDependencies` in a package manifest is written by tsdown on every build, so a vendored package's bump lands in a reviewed diff — every package included, `apps/functions` among them: it keeps the `main` the Functions host reads through `exports: { legacy: true }` rather than by switching generation off, and generation is the same write that records the list. Nothing there is hand-maintained, so a recorded version that no longer exists under `node_modules/.pnpm` is a build nobody re-ran rather than an edit nobody made — rebuild and read the diff, which is also the explanation on offer for that package's bundle size moving when nothing in its own manifest did.

Any bump that reaches a `dist/` moves the bundle size snapshots. Refresh them per the `testing` skill's `references/platform-and-bundle-tests.md` — rebuild first, then the narrowed `-u` pair — never by editing a snapshot to the number a failure printed.

## Holding a dependency — `references/holding-a-dependency.md`

A hold is a `packageRules` entry naming the packages exactly with the reason as its `description`, paired with the catalog range that stops the same bump for pnpm — a caret alone at a major, a tilde inside one, `followTag` on a prerelease line, `enabled: false` for a dedicated pass. Which range pairs with which rule is that page.

## Overrides (`overrides:` in `pnpm-workspace.yaml`)

Temporary overrides that force a transitive dep to a safe version — the block itself is the list. Renovate reaches them like catalog entries. Remove one when the upstream package catches up; most carry no comment explaining why, so check git blame before removing one.

## Release age (`minimumReleaseAge: 0`)

A nonzero `minimumReleaseAge` makes pnpm refuse a version until it has been on the registry for a while — the standard quarantine against installing a compromised release in the window before it is pulled. It is `0` here deliberately, and Renovate's own `minimumReleaseAge` is unset for the same reason: being on the freshest version is the point, and a quarantine would have `pnpm outdated:dependencies` report updates that `pnpm refresh:lockfile` then declines to take, turning one clean pass into a partial one that has to be run again later for no result the first pass could act on.

What that trades is real and accepted: a just-published bad version installs immediately, and a minor or patch then merges to `main` on green with no person reading it. CI on the automerge branch is the whole gate, not a delay. Don't propose raising either.

## Limits (`:prHourlyLimit2` ignored, `:prConcurrentLimit10` kept)

The hourly limit only delays a bump the bot has already decided to make, so it is ignored. The concurrent limit stays, and "branchConcurrentLimit" inherits it: every automerge branch is a CI run, and ten in flight bounds what one Renovate run can start against the shared runners. A branch merges on green within the hour, so the cap costs a busy day at most one run's delay. Don't propose lifting it, and don't propose a lower one.

## Tracked issues (update normally, but watch these)

- **`oxlint`** — has `^`; open issue https://github.com/oxc-project/oxc/issues/13204.
- **`oxlint-tsgolint`** — a bump here is the one thing that could retire the `ignorePatterns` entry covering tsgo's infinite loop on the recursive `three/tsl` types. It ships its own Go binaries, so the `typescript` alias does not move it. Check it on every bump; the exclusion itself, and the CI symptom that does not look like a hang, are documented in the `oxlint` skill's `references/lint-configuration.md`.
- **`vitest`, `@vitest/coverage-v8`** — Renovate's vitest monorepo group moves them as the pair they are (`@vitest/coverage-v8` peers vitest at the exact version). A major also waits on `@nuxt/test-utils` peering the new line — it widens its `vitest` peer one major at a time, and the next major needs the same; no rule encodes that, because the peer conflict fails the install in the branch and a major is never automerged.

## Dependency placement — `build` skill

Which manifest lists a dependency, and what removing a library owes beyond its manifest line, are the `build` skill's.

## Caret rules

Every catalog entry has `^` except what a rule above explains: the exact pins (`drizzle-kit`, `drizzle-orm`, `typescript`) and the one tilde, the unocss trio. `h3` **has** a caret — it is capped by a rule, not by a missing `^`. A tilde is what a cap on a **minor** looks like in the catalog, and it never stands alone: the rule is what stops the bot, the tilde what stops a re-resolve.

Before adding a `^` to a caret-less entry, check it against the exact pins; if it's there, leave it alone. If it isn't, the missing caret is likely an oversight — add it.

**A prerelease keeps its caret.** Alpha/beta/rc/dev catalog entries are carets like everything else — this repo tracks their newest release deliberately, so a suggestion to pin one exactly (because a caret also satisfies the eventual stable, or because a sibling package's `peerDependencies` names one exact prerelease) is rejected, not applied. Drizzle is the standing exception, pinned for the reason given above, not a precedent to extend.
