# Comment Cleanup — Sweep Ledger

Goal: make every comment tight, generic, readable, and correctly placed across the whole repo, per the conventions in `.claude/skills/file-organization/SKILL.md` (**Whitespace & Comments**). This file tracks what's been swept so future passes skip unchanged files and resume where we left off.

**Last full sweep:** 2026-06-14 (covers all packages; baseline below).

To re-sweep efficiently, only re-check files changed since the last sweep date:

```bash
git log --since=2026-06-14 --name-only --pretty=format: -- '*.ts' '*.vue' | sort -u
```

Anything not in that list is already clean — skip it. After a re-sweep, bump the date above.

---

## Conventions (summary — full rules in the skill)

- No blank line **before or after** a `//` comment; the comment is the separator. **Exception**: `.test.ts`/`.test-d.ts` keep blanks required by `vitest/padding-around-*`. Also keep the structural blank at the import→body boundary.
- Keep comments tight, generic, readable, minimal — explain the _why_, drop concrete example values (versions, IDs, payloads, magic numbers). Single line preferred; keep a numbered/bulleted list when enumerating distinct items.
- Keep quoted error/warning text (e.g. `[Vue warn]: Invalid prop`) — trimmed to the minimal identifying fragment — so it stays greppable.
- Local `interface`/`type` declarations grouped at the top of the block (after imports).
- A hook capitalizes the first letter of every `//` line; that's fine, don't reword to dodge it (only avoid starting a wrapped line with a case-sensitive code identifier).
- Applies to `//`, `/* */`, and Vue `<!-- -->` comments alike.

---

## Coverage by package

All packages have had their **`^\s*//.{85,}` (long single-line)** comments swept as of the date above. Per-package notes:

| Package           | Status       | Notes                                                          |
| ----------------- | ------------ | -------------------------------------------------------------- |
| `app`             | ✅ long-line | components + composables + stores + services + server + shared |
| `vue-phaserjs`    | ✅ long-line | composables, store, models, test setup                         |
| `azure-mock`      | ✅ long-line | filter/search/container mocks                                  |
| `db-schema`       | ✅ long-line | schema + models                                                |
| `db`, `db-mock`   | ✅ long-line | already tight; minimal changes                                 |
| `shared`          | ✅ long-line | `takeOne`                                                      |
| `configuration`   | ✅ long-line | external lists, global.d.ts; `fixAjv.ts` left intentionally    |
| `xml2js`          | ✅ long-line | `Parser.ts`                                                    |
| `parse-tmx`       | ✅ long-line | `TMXNode.ts`                                                   |
| `azure-functions` | ✅ long-line | only ts-directive comments, left as-is                         |

Also swept repo-wide as of the date above:

- **Long single-line `//` comments** (`^\s*//.{85,}`) — all packages.
- **Multi-line `//` blocks** (4+ consecutive lines) — all 40 matches triaged; verbose prose tightened, section-label/numbered-reason lists kept.
- **Vue `<!-- -->` template comments** — all 14 matches; multi-line ones tightened, directives/attribution kept.
- **Blank-before-comment** in non-test source — removed (kept in `.test`/`.bench` for `vitest/padding-around-*`, and at the import→body boundary).
- **`/* */` / `/** \*/` block comments** — spot-checked; azure-mock SDK JSDoc mirrors, desmos/`.d.ts` re-exports, and constant-map section labels left intact.

### Possible future spot-checks

- 3-line `//` blocks where every line is < 85 chars (rare; the long-line grep already caught any block containing a long line).
- New `/** */` JSDoc added since the sweep date.

---

## Intentionally left as-is

- `app/configuration/plugins/fixAjv.ts` + `fixAjv.test.ts` — the numbered transform-step list is a deliberate reference; wording already tight.
- `app/shared/types/nuxt.d.ts`, `app/app/types/desmos.d.ts`, `configuration/types/global.d.ts` — vendored/upstream-synced type augmentations.
- `app/util/math/random/getRandomValues.ts`, `db/src/services/azure/table/getTableNullClause.ts` — single source-URL reference comments.
- `*/rolldown.config.ts`, scattered `@ts-expect-error`/`oxlint-disable` lines — directive comments (kept; reasons trimmed where verbose).

---

## How to run the next sweep

1. Get the changed-file list with the `git log --since` command above; restrict all greps below to those files.
2. Long single-line comments: `Grep` `^\s*//.{85,}` over `*.ts`, `*.vue`.
3. Blank-before-comment: multiline `Grep` `\n[ \t]*\n[ \t]*//` (skip `.test.ts`/`.test-d.ts` and the import→body boundary).
4. Block comments: `/\*` over `*.vue` (ignore `import.meta.glob` hits) and `*.ts`.
5. Vue template comments: `<!--` over `*.vue`.
6. Tighten/genericise per the conventions above; bump the sweep date.
