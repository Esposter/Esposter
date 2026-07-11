---
title: Comment Cleanup
description: Sweep ledger for keeping every comment tight, generic, and correctly placed repo-wide — tracks the last sweep date so re-sweeps only touch changed files.
---

# Comment Cleanup

Goal: make every comment tight, generic, readable, and correctly placed across the whole repo, per the **Whitespace & Comments** conventions in `.claude/skills/file-organization/SKILL.md`. This ledger tracks what has been swept so future passes skip unchanged files and resume where the last one left off.

**Last full sweep:** 2026-06-14 (covers all packages; baseline below).

To re-sweep efficiently, only re-check files changed since the last sweep date, then bump the date above:

```bash
git log --since=2026-06-14 --name-only --pretty=format: -- '*.ts' '*.vue' | sort -u
```

Anything not in that list is already clean — skip it.

## Conventions (summary — full rules in the skill)

- No blank line before or after a `//` comment; the comment is the separator. Exception: `.test.ts`/`.test-d.ts` keep blanks required by `vitest/padding-around-*`, and the structural blank at the import→body boundary stays.
- Keep comments tight, generic, readable, minimal — explain the _why_, drop concrete example values (versions, IDs, payloads, magic numbers). Single line preferred; keep numbered/bulleted lists when enumerating distinct items.
- Keep quoted error/warning text (e.g. `[Vue warn]: Invalid prop`) trimmed to the minimal identifying fragment so it stays greppable.
- Local `interface`/`type` declarations grouped at the top of the block (after imports).
- A hook capitalizes the first letter of every `//` line; that's fine — only avoid starting a wrapped line with a case-sensitive code identifier.
- Applies to `//`, `/* */`, and Vue `<!-- -->` comments alike.

## Coverage baseline (as of the sweep date)

All packages have had long single-line comments (`^\s*//.{85,}`) swept:

| Package           | Status | Notes                                                          |
| ----------------- | ------ | -------------------------------------------------------------- |
| `app`             | done   | components + composables + stores + services + server + shared |
| `vue-phaserjs`    | done   | composables, store, models, test setup                         |
| `azure-mock`      | done   | filter/search/container mocks                                  |
| `db-schema`       | done   | schema + models                                                |
| `db`, `db-mock`   | done   | already tight; minimal changes                                 |
| `shared`          | done   | `takeOne`                                                      |
| `configuration`   | done   | external lists, global.d.ts; `fixAjv.ts` left intentionally    |
| `xml2js`          | done   | `Parser.ts`                                                    |
| `parse-tmx`       | done   | `TMXNode.ts`                                                   |
| `azure-functions` | done   | only ts-directive comments, left as-is                         |

Also swept repo-wide as of the date above: multi-line `//` blocks (4+ consecutive lines — verbose prose tightened, section-label/numbered lists kept), Vue `<!-- -->` template comments, blank-before-comment in non-test source, and a spot-check of `/* */` block comments (azure-mock SDK JSDoc mirrors, desmos/`.d.ts` re-exports, and constant-map section labels left intact).

Possible future spot-checks: 3-line `//` blocks where every line is under 85 chars, and new `/** */` JSDoc added since the sweep date.

## Intentionally left as-is

- `app/configuration/plugins/fixAjv.ts` + `fixAjv.test.ts` — the numbered transform-step list is a deliberate reference; wording already tight.
- `app/shared/types/nuxt.d.ts`, `app/app/types/desmos.d.ts`, `configuration/types/global.d.ts` — vendored/upstream-synced type augmentations.
- `app/util/math/random/getRandomValues.ts`, `db/src/services/azure/table/getTableNullClause.ts` — single source-URL reference comments.
- `*/rolldown.config.ts` and scattered `@ts-expect-error`/`oxlint-disable` lines — directive comments (kept; reasons trimmed where verbose).

## How to run the next sweep

1. Get the changed-file list with the `git log --since` command above; restrict all greps below to those files.
2. Long single-line comments: grep `^\s*//.{85,}` over `*.ts`, `*.vue`.
3. Blank-before-comment: multiline grep `\n[ \t]*\n[ \t]*//` (skip `.test.ts`/`.test-d.ts` and the import→body boundary).
4. Block comments: `/\*` over `*.vue` (ignore `import.meta.glob` hits) and `*.ts`.
5. Vue template comments: `<!--` over `*.vue`.
6. Tighten/genericise per the conventions above; bump the sweep date.
