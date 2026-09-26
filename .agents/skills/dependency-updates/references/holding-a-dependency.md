# Holding a dependency

Read when a bump has to be stopped — at a major, inside one, behind a dist-tag, or altogether — or when `pnpm outdated:dependencies` lists a package as held and the question is what pairs with the rule. `SKILL.md` keeps the one line that a hold is a `packageRules` entry whose `description` is the reason; this page is which catalog range goes beside each kind of rule.

A hold is a `packageRules` entry naming the packages exactly (`matchPackageNames`; the report throws on a glob or regex, because it matches names and nothing else) and carrying the reason as its `description` and nowhere else — the report prints it. The catalog range beside it says what **pnpm** may resolve, and the two are one cap in two dialects:

- **A cap at a major needs only the rule** — the caret already stops a re-resolve, in the catalog and `overrides:` alike, and the rule's `allowedVersions` names the next major as the ceiling.
- **A cap inside a major needs the rule and a tilde** — a caret would float `pnpm refresh:lockfile` straight into it — and the rule's `allowedVersions` names the next minor. A family whose packages pin each other to their own exact version is one rule over all of them; the rule and the tilde widen back together.
- **A dedicated pass is `enabled: false`** beside an exact pin. A package aliased under `overrides:` — `typescript` to the bridge that runs `tsc`/`vue-tsc` on the Go compiler (`apps/web/content/docs/architecture/monorepo-tooling.md`) — is matched by its resolved name, so the rule names the alias target beside the alias.
- **An exact pin on a prerelease line is `followTag`** — no `^`, since a caret would float it across the per-commit builds a publisher ships under a dist-tag per branch. The report follows the same tag: `pnpm outdated:dependencies` asks the registry for it rather than `latest` for a followed package.
