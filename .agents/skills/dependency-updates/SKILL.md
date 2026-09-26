---
name: dependency-updates
description: Apply when updating package versions, taking a major, bumping a GitHub Action or the node version, or editing renovate.json. Esposter's dependency updates — Renovate writes every version and renovate.json packageRules are the one statement of which dependency is held and why, so a hand bump follows the bot's path and a major owes a release-note audit whose record is the commit body; minimumReleaseAge stays 0, and a hand pass is one commit.
---

# Dependency Updates

All version numbers live in the `catalog:` section of `pnpm-workspace.yaml` at the repo root. Individual `package.json` files reference them with `catalog:` — never edit version numbers there.

**Renovate writes versions; people write policy.** Every version the repo declares is reached by Renovate — the catalog and `overrides:`, `.node-version`, `packageManager`, every action under `.github/`, every `FROM` — and a minor or patch merges on green without a person in the loop, a major — or any pnpm bump — waits for one. The one version outside the bot is the Functions host's node major in `apps/infra`, capped by what the runtime supports and moved by hand (the `pulumi-infra` skill's Settled list). What a person owns is `renovate.json`'s `packageRules`: every cap, disable, group and read-before-merge is one rule there with a `description` that is the reason, and **`pnpm outdated:dependencies` reads the same rules**, so a version the bot would not propose is listed as held rather than as a bump to take. Policy written anywhere else — a range trick in the catalog, a note in this skill alone — is policy the bot cannot read. Which rules exist and what each manager reaches is `references/renovate.md`.

## Settled — do not re-propose

- **A confirmation gate before `pnpm refresh:lockfile`** (step 3 of `references/bumping-by-hand.md`). Its process kill is the precondition the delete needs on Windows, everything it ends is a restartable process of this repo's own, and a pass runs unattended — a gate turns it into one that stops to ask a question whose answer is yes. The trade is written at that step, and a review finding asking for the gate is answered with this line (the `coderabbit` skill's Settled list).
- **Raising `minimumReleaseAge` above `0`, in pnpm or Renovate.** Being on the freshest version is the point, and a quarantine turns one clean pass into a partial one (`references/renovate.md`).
- **Lifting or lowering `:prConcurrentLimit10`, or honouring `:prHourlyLimit2`.** The hourly limit only delays a decided bump; ten branches in flight bounds one run against the shared runners (`references/renovate.md`).
- **Splitting a hand pass into one commit per major.** A pass is one commit whose body carries a section per major; the split bought a per-package revert this repo never performs and cost a hand-reconciled lockfile per commit (`references/major-upgrades.md` §5).

## Rules

- **A bump ahead of the bot takes Renovate's path** — `pnpm outdated:dependencies`, the catalog edit keeping its `^`, `pnpm refresh:lockfile`, and the outdated check again until it passes (`references/bumping-by-hand.md`).
- **A major — a red row in `pnpm outdated:dependencies`, or the PR Renovate opens because it never automerges one — owes an audit whose record is the commit body**: the notes read from the tag, every breaking bullet answered by a grep, every release in between read, and the features weighed against what the repo hand-rolled in their absence (`references/major-upgrades.md`).
- **A pnpm bump of any size owes the features half of that audit** (`references/pnpm-bumps.md`).
- **A GitHub Action is pinned to the tag's dereferenced commit SHA** — `uses: <owner>/<action>@<commit-sha> # v<version>`, never the annotated tag object, which Actions cannot resolve (`references/github-actions.md`).
- **`.node-version` is the one node pin, never hand-edited**, with no `engines.node` or `devEngines.runtime` beside it bar the persona plugin's feature floor (the `file-organization` skill, `references/new-package.md`); Renovate's `node` group or `pnpm update:node [version]` moves it with `@types/node` (`references/updating-node.md`).
- **A bump owes what it moves beyond the version** — the `@TODO`s linking the package, the PGlite and UnoCSS snapshots, `inlinedDependencies` and the bundle sizes (`references/bump-follow-through.md`).
- **A hold is a `packageRules` entry naming the packages exactly, its reason the `description`**, paired with the catalog range that stops the same bump for pnpm (`references/holding-a-dependency.md`).
- **Every catalog entry has `^`, a prerelease included**, except the tilde or exact pin a hold pairs with its rule (`references/caret-rules.md`).
- **An `overrides:` entry is a temporary force of a transitive dependency**, removed when upstream catches up (`references/overrides.md`).
- **`oxlint`, `oxlint-tsgolint` and the vitest pair update normally**, each with something a bump watches (`references/tracked-issues.md`).
- **Which manifest lists a dependency, and what removing a library owes, are the `build` skill's** (`references/dependency-placement.md`).

## Reference pages

- `references/bumping-by-hand.md` — when taking a bump ahead of Renovate, or the first `pnpm` command dies in `postinstall`.
- `references/major-upgrades.md` — when a red row appears in `pnpm outdated:dependencies`, or Renovate opens a major PR.
- `references/pnpm-bumps.md` — when `packageManager` moves.
- `references/github-actions.md` — when bumping an action to a new release.
- `references/updating-node.md` — when the node version moves, or a sandbox cannot find corepack after it did.
- `references/bump-follow-through.md` — when any bump lands, before committing it.
- `references/holding-a-dependency.md` — when a bump has to be stopped, or a package is listed as held.
- `references/caret-rules.md` — when adding, removing or questioning a catalog entry's `^`, `~` or exact pin.
- `references/overrides.md` — when adding or removing an `overrides:` entry.
- `references/tracked-issues.md` — when bumping `oxlint`, `oxlint-tsgolint`, `vitest` or `@vitest/coverage-v8`.
- `references/renovate.md` — when editing `renovate.json`, or checking why the bot proposed nothing for a dependency.
