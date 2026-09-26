# Renovate — `renovate.json`

Read when editing `renovate.json`, adding a `FROM` line or a version field Renovate has to reach, or checking why the bot proposed nothing for a dependency. This page holds what each manager reaches, what each rule is for and how to see what a rule does; `SKILL.md` keeps the one line that Renovate writes versions and `packageRules` holds the policy.

## What it reaches

| Declared in                                                 | Manager          | Note                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| :---------------------------------------------------------- | :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm-workspace.yaml` `catalog:` and `overrides:`           | `npm`            | The versions. A manifest's `catalog:` reference is `unspecified-version` by design — the catalog entry is the dep.                                                                                                                                                                                                                                                                                                                                         |
| `.node-version`                                             | `nodenv`         | The one node pin — `pnpm/setup` installs it on the runners and fnm switches to it; the `node` group lands it with `@types/node`. A version the bot must move lives where a built-in manager reads it: Renovate hands `rangeStrategy` only to built-in managers, so a pin read by a custom manager is never bumped inside its major, which is how a JSONata-read `devEngines.runtime` drifted behind `engines.node` before both were folded into this file. |
| `package.json` `packageManager`                             | `npm`            | An exact version by format (corepack reads one), so the repo-wide "updatePinnedDependencies" stays at its default; the release's digest is resolved with the version, so the `+sha512.…` suffix is rewritten rather than dropped.                                                                                                                                                                                                                          |
| `.github/workflows/*.yaml`, `.github/actions/*/action.yaml` | `github-actions` | `helpers:pinGitHubActionDigests` keeps every `uses:` on a commit SHA with the version comment. Runner labels are read too: `ubuntu-latest` has no version and is left alone, `ubuntu-26.04` moves when a newer image exists. `pulumi/actions` carries no `pulumi-version` on purpose — the CLI is whatever is latest when the workflow runs, and a declared version would be a diff no check in the branch exercises.                                      |
| `*/Dockerfile` `FROM`                                       | `dockerfile`     | See the digest rule below.                                                                                                                                                                                                                                                                                                                                                                                                                                 |

The local dry run at the bottom prints this table for the working tree — every dep with its `updates` or the "skipReason" that emptied it.

## The rules

Rules are read in order and a later key overrides an earlier one, which is why the drizzle `automerge: false` sits after the minor/patch automerge rule. Every rule that names packages does so exactly — `pnpm outdated:dependencies` reads the same file and matches names, throwing on a glob or regex so the two readers of one policy cannot silently disagree.

- **Minor and patch automerge on the branch** — no PR, merged to `main` when the checks pass. A major opens a PR for a person. `lockFileMaintenance` (the weekly transitive refresh) and the Docker digest rule automerge the same way: `automergeType: "branch"` is set once at the top level, where every `automerge: true` inherits it, rather than restated per rule — the key does nothing where `automerge` is false, so a major still opens its PR.
- **Holds** — `h3` and the unocss trio by `allowedVersions`; `typescript` and `typescript-native-bridge` by `enabled: false`. The reasons are the descriptions, and `references/holding-a-dependency.md` says which catalog range pairs with each.
- **drizzle** — `followTag: "rc"`, grouped, `automerge: false`. `pnpm outdated:dependencies` reads the key and asks the registry for the same tag, since `pnpm outdated` compares against `latest` and a prerelease pin is never below it.
- **node** — `groupName: "node"` over `node` and `@types/node` with `ignoreUnstable: false`, so `.node-version` and the types move in one branch along the Current line. The machine's side of a node bump (`fnm`, corepack) is `references/updating-node.md`.
- **pnpm** — `automerge: false`, so a pnpm minor opens a PR that waits for the release-note read `SKILL.md` describes.
- **`Esposter/Esposter`** `enabled: false` — the collector's reusable workflow at a branch ref.
- **Docker digests** — `pinDigests: true` on `matchDatasources: ["docker"]`, and a second docker-only rule automerging `digest`/`pinDigest`. An action's digest update (a tag re-pointed under the same version) matches neither automerge rule and opens a PR, which is the point of the SHA pin.

Each rule's `description` is the reason, and the one copy of it: the report prints it, and this page and `SKILL.md` name the keys and point here.

Repo-wide: `rangeStrategy: bump` rewrites the range itself (`^4.13.2` → `^4.13.3`), so the catalog always names the version that is installed; deduplication is `pnpm-workspace.yaml`'s `autoDedupe`, which every non-frozen install applies, the bot's included, so no Renovate post-update step restates it; `osvVulnerabilityAlerts` opens a PR for a known-vulnerable version regardless of anything else, and the dependency dashboard lists the unresolved ones; `configMigration` opens a PR when a Renovate release renames a setting this file uses. `:prHourlyLimit2` is ignored and `:prConcurrentLimit10` from `config:recommended` is kept — the branch limit inherits it — for the reason in `SKILL.md`'s "Limits".

## Seeing what a rule reaches

To see what Renovate would do with the working tree, run it against the checkout instead of waiting for the bot:

```bash
PNPM_CONFIG_STRICT_DEP_BUILDS=false RENOVATE_PLATFORM=local RENOVATE_DRY_RUN=full LOG_LEVEL=debug pnpm dlx renovate
```

The env var is what lets the install run Renovate's own native build scripts, which pnpm blocks by default. The `packageFiles with updates` block of the log is the answer — every dep with the `updates` it earned, or the "skipReason" that emptied it (`disabled` is a rule, `is-pinned` a pin the config declines, `github-token-required` is the local run having no token and means nothing about the bot). `renovate-config-validator` checks the schema only, so a rule that parses and still does nothing shows up here and nowhere else — a `matchPackageNames` that names the alias where Renovate matches the resolved package (`typescript` vs `typescript-native-bridge`) is exactly that case.

## Release age (`minimumReleaseAge: 0`)

A nonzero `minimumReleaseAge` makes pnpm refuse a version until it has been on the registry for a while — the standard quarantine against installing a compromised release in the window before it is pulled. It is `0` here deliberately, and Renovate's own `minimumReleaseAge` is unset for the same reason: being on the freshest version is the point, and a quarantine would have `pnpm outdated:dependencies` report updates that `pnpm refresh:lockfile` then declines to take, turning one clean pass into a partial one that has to be run again later for no result the first pass could act on.

What that trades is real and accepted: a just-published bad version installs immediately, and a minor or patch then merges to `main` on green with no person reading it. CI on the automerge branch is the whole gate, not a delay. Don't propose raising either.

## Limits (`:prHourlyLimit2` ignored, `:prConcurrentLimit10` kept)

The hourly limit only delays a bump the bot has already decided to make, so it is ignored. The concurrent limit stays, and "branchConcurrentLimit" inherits it: every automerge branch is a CI run, and ten in flight bounds what one Renovate run can start against the shared runners. A branch merges on green within the hour, so the cap costs a busy day at most one run's delay. Don't propose lifting it, and don't propose a lower one.
