---
name: dependency-updates
description: Apply when updating package versions, taking a major, bumping a GitHub Action or the node version, or editing renovate.json. Esposter dependency update process — a Settled list (no confirmation gate before the lockfile refresh, one commit per hand pass), Renovate as the writer of every version and renovate.json packageRules as the one statement of which dependency is held and why, every catalog entry with a caret unless a rule says otherwise, a major owing a release-note audit whose record is the commit body, actions pinned to a dereferenced commit SHA, node moved by the node group or pnpm update:node, minimumReleaseAge kept at 0, and the tracked issues a bump watches.
---

# Dependency Updates

All version numbers live in the `catalog:` section of `pnpm-workspace.yaml` at the repo root. Individual `package.json` files reference them with `catalog:` — never edit version numbers there.

**Renovate writes versions; people write policy.** Every version the repo declares is reached by Renovate — the catalog and `overrides:`, `.node-version`, `packageManager`, every action under `.github/`, every `FROM` — and a minor or patch merges on green without a person in the loop, a major — or any pnpm bump — waits for one. The one version outside the bot is the Functions host's node major in `apps/infra`, capped by what the runtime supports and moved by hand (`pulumi-infra`). What a person owns is `renovate.json`'s `packageRules`: every cap, disable, group and read-before-merge is one rule there with a `description` that is the reason, and **`pnpm outdated:dependencies` reads the same rules**, so a version the bot would not propose is listed as held rather than as a bump to take. Policy written anywhere else — a range trick in the catalog, a note in this skill alone — is policy the bot cannot read, which is how the unocss tilde churned a branch every run. Which rules exist and what each manager reaches is `references/renovate.md`.

## Settled — do not re-propose

- **A confirmation gate before `pnpm refresh:lockfile`** (step 3 of `references/bumping-by-hand.md`). Its process kill is the precondition the delete needs on Windows, everything it ends is a restartable process of this repo's own, and a pass runs unattended — a gate turns it into one that stops to ask a question whose answer is yes. The trade is written at that step, and a review finding asking for the gate is answered with this line (`coderabbit`).
- **Raising `minimumReleaseAge` above `0`, in pnpm or Renovate.** Being on the freshest version is the point, and a quarantine turns one clean pass into a partial one (`references/renovate.md`).
- **Lifting or lowering `:prConcurrentLimit10`, or honouring `:prHourlyLimit2`.** The hourly limit only delays a decided bump; ten branches in flight bounds one run against the shared runners (`references/renovate.md`).
- **Splitting a hand pass into one commit per major.** A pass is one commit whose body carries a section per major; the split bought a per-package revert this repo never performs and cost a hand-reconciled lockfile per commit (`references/major-upgrades.md` §5).

## Bumping by hand

A bump ahead of the bot takes Renovate's path — `pnpm outdated:dependencies`, the catalog edit keeping its `^`, `pnpm refresh:lockfile`, and the outdated check again until it passes — and the steps, the refresh's process kill and a `postinstall` that dies on drift are `references/bumping-by-hand.md`.

### A major is a version write plus an audit — `references/major-upgrades.md`

A minor or patch is the hand-bump steps plus what a bump owes beyond the version. A **major** — a red row in `pnpm outdated:dependencies`, or the PR Renovate opens because it never automerges one — additionally owes an audit whose record is the commit body: the release notes read from the tag with `gh release view` rather than from a summary of them, every breaking bullet answered by a grep that excludes the generated trees, every release in between read when more than one major is crossed, and the **features** list weighed against what this repo hand-rolled in its absence — a major is when that debt is cheapest to shed, so the migration lands in the same commit as the bump and a rejected one is rejected in writing. Doing all of that is that page.

### pnpm is read at every minor — `references/pnpm-bumps.md`

A pnpm bump of any size owes the features half of the major audit: every release it crosses read from the tag, and a new setting taken or declined in the bump's own commit.

### GitHub Actions are pinned to a dereferenced commit SHA — `references/github-actions.md`

`uses: <owner>/<action>@<commit-sha> # v<version>`, and the SHA is the tag's dereferenced target (`refs/tags/<version>^{}`), never the annotated tag object, which GitHub Actions cannot resolve. Renovate keeps them (`helpers:pinGitHubActionDigests`); **bumping one by hand** is that page.

### Node is one pin — `references/updating-node.md`

`.node-version` is the one node pin — no `engines.node` or `devEngines.runtime` beside it, bar the persona plugin's feature floor (`file-organization`, `references/new-package.md`) — and `@types/node` follows its major, so Renovate's `node` group moves the two in one branch, and `pnpm update:node [version]` from the repo root is the same write by hand plus the machine's side — installing and defaulting the version with fnm and enabling corepack — which is why it is also the command to run after pulling a merged node bump. The pin is never hand-edited. **Moving the node version**, and the corepack failure a Windows sandbox shows afterwards, is that page.

## What a bump owes beyond the version — `references/bump-follow-through.md`

The `@TODO`s linking the package, and whichever of the PGlite snapshot, the UnoCSS resolved-config snapshot, `inlinedDependencies` and the bundle size snapshots the bump moves.

## Holding a dependency — `references/holding-a-dependency.md`

A hold is a `packageRules` entry naming the packages exactly with the reason as its `description`, paired with the catalog range that stops the same bump for pnpm — a caret alone at a major, a tilde inside one, `followTag` on a prerelease line, `enabled: false` for a dedicated pass. Which range pairs with which rule is that page.

## Overrides — `references/overrides.md`

A temporary force of a transitive dependency to a safe version, removed when upstream catches up.

## Tracked issues — `references/tracked-issues.md`

`oxlint`, `oxlint-tsgolint` and the vitest pair update normally, each with something a bump watches.

## Dependency placement — `build` skill

Which manifest lists a dependency, and what removing a library owes beyond its manifest line, are the `build` skill's.

## Caret rules — `references/caret-rules.md`

Every catalog entry has `^` — a prerelease included — except the exact pins and the one tilde a rule explains.
