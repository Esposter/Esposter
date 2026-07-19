---
title: Migration Chain Guard
description: A db-schema test asserting the Drizzle migration snapshots form one linear chain — catching forked or hand-edited migration state in CI instead of at the next db:gen.
---

# Migration Chain Guard

Every migration folder under `packages/app/server/db/migrations/` carries a `snapshot.json` whose `id`/`prevIds` fields encode the migration lineage. A hand-cloned or hand-edited snapshot forks that chain, and today the fork surfaces only when the next `pnpm db:gen` fails with `Non-commutative migrations detected` — on a different machine, in a different session, long after the offending commit. The invariant is mechanical, so CI should assert it.

## What works today

`db:gen` is the only sanctioned producer of `snapshot.json`, and the repo guidance (agent guide + drizzle skill) bans hand-cloning. Nothing verifies the invariant after the fact — a bad snapshot merges silently.

## What this adds

One test file in `packages/db-schema` that globs `*/snapshot.json` in the migrations folder and asserts:

1. **Unique ids** — no two snapshots share an `id`.
2. **Linear chain** — every snapshot's `prevIds` has exactly one element (the initial migration excepted), each referenced id exists, and walking parent links from the single head visits every snapshot exactly once — no forks, no orphans, no cycles.
3. **Chain order matches folder order** — the lineage walk sorted oldest-first matches the folders' timestamp-prefix sort, so a renamed folder can't silently reorder application.
4. **Folder shape** — every migration folder contains exactly `migration.sql` + `snapshot.json`, and every folder name keeps the `YYYYMMDDHHMMSS_description` form.

## Failure semantics

Assertion messages name the offending folder and the broken invariant (duplicate id, dangling `prevIds`, fork point, order mismatch). The fix is always the same: delete the hand-made state and regenerate with `pnpm db:gen` — the test's error message says so.

## Key files

| File                                   | Role                                          |
| -------------------------------------- | --------------------------------------------- |
| `packages/app/server/db/migrations/`   | the validated tree — one folder per migration |
| `packages/db-schema/drizzle.config.ts` | source of the migrations-folder path          |

## Notes

- `migration.sql` content is deliberately not validated: hand-fixing un-applied SQL is allowed and expected (data-preserving rewrites); only the machine-state `snapshot.json` chain is guarded.
- Zero new dependencies — a plain Vitest file reading JSON.
