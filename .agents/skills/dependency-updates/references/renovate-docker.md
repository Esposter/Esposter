# Docker Base Images in `renovate.json`

Read when editing `renovate.json`, adding a `FROM` line, or checking why Renovate proposed nothing for an image. This page holds the whole rule; `SKILL.md` keeps the one line that image tags are the exemption from `updatePinnedDependencies: false`.

Renovate's `dockerfile` manager finds every `FROM` line with no `fileMatch` of its own, but what it may do with one is a `packageRules` entry keyed on `matchDatasources: ["docker"]`, because two repo-wide settings work against an image tag:

- `updatePinnedDependencies: false` is there for the exact-pinned npm deps above that owe a dedicated pass. An image tag is a single version by definition, so without the override every `FROM` is skipped as `is-pinned` and Renovate proposes nothing — not a manager that failed to run, so no log line says the word Docker.
- A tag that carries no version in it (a distro codename, `latest`) gives Renovate nothing to compare, so it can never be bumped by tag at all. That is a statement about the tag string, not about the image: a publisher can repoint such a tag at a new digest whenever they like, and `latest` is mutable by design. `pinDigests: true` is what reaches it: Renovate rewrites the line to `<tag>@sha256:…` once, then keeps that digest current — which is also what turns an otherwise invisible upstream rebuild into a reviewable diff.

Both are read during the lookup, so the rule carrying them takes no `matchUpdateTypes` — an update type exists only once the lookup has produced an update, so a rule gated on one cannot decide whether the lookup runs. That is why the digest automerge is a second rule rather than the same one. The datasource is the axis rather than the manager: the reason is a property of image tags, so it holds wherever one is declared, while a pin this repo chose on another datasource (a runner label, `packageManager`) stays skipped.

To see what Renovate would do with the working tree, run it against the checkout instead of waiting for the bot:

```bash
PNPM_CONFIG_STRICT_DEP_BUILDS=false RENOVATE_PLATFORM=local RENOVATE_DRY_RUN=full LOG_LEVEL=debug pnpm dlx renovate
```

The env var is what lets the install run Renovate's own native build scripts, which pnpm blocks by default. The `packageFiles with updates` block of the log is the answer — every dep with the `updates` it earned, or the `skipReason` that emptied it. `renovate-config-validator` checks the schema only, so a rule that parses and still does nothing shows up here and nowhere else.
