# Renovate — `renovate.json`

Read when editing `renovate.json`, adding a `FROM` line or a version field Renovate has to reach, or checking why the bot proposed nothing for a dependency. This page holds what each manager reaches, what each rule is for and how to see what a rule does; `SKILL.md` keeps the one line that Renovate writes versions and `packageRules` holds the policy.

## What it reaches

| Declared in                                                 | Manager                      | Note                                                                                                                                                                                                                              |
| :---------------------------------------------------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm-workspace.yaml` `catalog:` and `overrides:`           | `npm`                        | The versions. A manifest's `catalog:` reference is `unspecified-version` by design — the catalog entry is the dep.                                                                                                                |
| `package.json` `engines.node`                               | `npm`                        | `node-version` datasource, `node` versioning.                                                                                                                                                                                     |
| `package.json` `devEngines.runtime`                         | `customManagers` (`jsonata`) | The npm manager does not extract it, so one JSONata expression reads the field; same datasource and versioning as `engines`, and the `node` group lands both with `@types/node`.                                                  |
| `package.json` `packageManager`                             | `npm`                        | An exact version by format (corepack reads one), so the repo-wide `updatePinnedDependencies` stays at its default; the release's digest is resolved with the version, so the `+sha512.…` suffix is rewritten rather than dropped. |
| `.github/workflows/*.yaml`, `.github/actions/*/action.yaml` | `github-actions`             | `helpers:pinGitHubActionDigests` keeps every `uses:` on a commit SHA with the version comment. Runner labels are read too: `ubuntu-latest` has no version and is left alone, `ubuntu-26.04` moves when a newer image exists.      |
| `*/Dockerfile` `FROM`                                       | `dockerfile`                 | See the digest rule below.                                                                                                                                                                                                        |

The local dry run at the bottom prints this table for the working tree — every dep with its `updates` or the `skipReason` that emptied it.

## The rules

Rules are read in order and a later key overrides an earlier one, which is why the drizzle `automerge: false` sits after the minor/patch automerge rule. Every rule that names packages does so exactly — `pnpm outdated:dependencies` reads the same file and matches names, throwing on a glob or regex so the two readers of one policy cannot silently disagree.

- **Minor and patch automerge on the branch** — no PR, merged to `main` when the checks pass. A major opens a PR for a person. `lockFileMaintenance` (the weekly transitive refresh) automerges the same way.
- **Holds** — `h3` `allowedVersions: "<2"`; the unocss trio `allowedVersions: "<66.10"`; `typescript` and `typescript-native-bridge` `enabled: false`. The reasons are the descriptions, and `SKILL.md`'s "Holding a dependency" says which catalog range pairs with each.
- **drizzle** — `followTag: "rc"`, grouped, `automerge: false`. Without the tag Renovate proposes the per-commit prerelease builds (`1.0.0-rc.5-ab785fc`) drizzle publishes under a dist-tag per branch; with it the pin moves only when the `rc` tag does. `followTag` keeps following the tag after 1.0.0 goes stable, so it is dropped then.
- **node** — `groupName: "node"` over `node` and `@types/node`, so `engines.node`, `devEngines.runtime` and the types move in one branch. The machine's side of a node bump (`fnm`, corepack) is `references/updating-node.md`.
- **`Esposter/Esposter`** `enabled: false` — the collector calls its own reusable workflow at `@ai/queue`, a branch ref Renovate reads as a pinned version and would replace with a tag.
- **Docker digests** — a tag that carries no version (a distro codename, `latest`) gives Renovate nothing to compare, yet its publisher can repoint it at any time. `pinDigests: true` on `matchDatasources: ["docker"]` rewrites the line to `<tag>@sha256:…` once and then keeps the digest current, turning an invisible upstream rebuild into a reviewable diff. It is read during the lookup, so that rule carries no `matchUpdateTypes` — an update type exists only once the lookup has produced an update — and the digest automerge is a second rule for that reason.

Repo-wide: `rangeStrategy: bump` rewrites the range itself (`^4.13.2` → `^4.13.3`), so the catalog always names the version that is installed; `postUpdateOptions: ["pnpmDedupe"]` runs `pnpm dedupe` after every update; `osvVulnerabilityAlerts` opens a PR for a known-vulnerable version regardless of anything else, and the dependency dashboard lists the unresolved ones; `configMigration` opens a PR when a Renovate release renames a setting this file uses.

## Seeing what a rule reaches

To see what Renovate would do with the working tree, run it against the checkout instead of waiting for the bot:

```bash
PNPM_CONFIG_STRICT_DEP_BUILDS=false RENOVATE_PLATFORM=local RENOVATE_DRY_RUN=full LOG_LEVEL=debug pnpm dlx renovate
```

The env var is what lets the install run Renovate's own native build scripts, which pnpm blocks by default. The `packageFiles with updates` block of the log is the answer — every dep with the `updates` it earned, or the `skipReason` that emptied it (`disabled` is a rule, `is-pinned` a pin the config declines, `github-token-required` is the local run having no token and means nothing about the bot). `renovate-config-validator` checks the schema only, so a rule that parses and still does nothing shows up here and nowhere else — a `matchPackageNames` that names the alias where Renovate matches the resolved package (`typescript` vs `typescript-native-bridge`) is exactly that case.
