# Constraints and indexes

Read when adding a CHECK constraint, unique constraint or index to a table.

## Naming

One rule, no exceptions: **`{table}_{column…}_{qualifier…}_{kind}`**, where every component is the DDL identifier verbatim — so camelCase throughout — and `_` is only ever the separator between components. `kind` is `check`, `unique` or `index`. Always explicit and descriptive; never a bare column name like `"name"` or `"position"`.

| Type              | Pattern                         | Example                                      |
| ----------------- | ------------------------------- | -------------------------------------------- |
| Length check      | `{table}_{column}_length_check` | `"users_name_length_check"`                  |
| Other check       | `{table}_{column}_check`        | `"roomCategories_position_check"`            |
| Multi-column      | `{table}_{col1}_{col2}_check`   | `"invites_uses_maxUses_check"`               |
| Unique constraint | `{table}_{col1}_{col2}_unique`  | `"pushSubscriptions_endpoint_userId_unique"` |
| Index             | `{table}_{col}_index`           | `"blocks_blockedId_index"`                   |
| Composite index   | `{table}_{col1}_{col2}_index`   | `"roomRoles_roomId_position_index"`          |

**There is no "semantic name" escape.** A constraint whose meaning reads better as a phrase (`no_self_block`) still names its table and columns, because the phrase is the one thing the error message cannot tell you — `blocks_blockerId_blockedId_check` says where to look, and the `sql` body says what it forbids. A partial index names the predicate's column too (`roomRoles_roomId_isEveryone_unique`), so two partial uniques on one column stay distinguishable.

## A count on a render path gets its own partial index

A composite index built for a list read (`{userId, createdAt DESC}`) answers a **count over a filtered subset**
badly: it is ordered for paging, so counting the matching rows walks the owner's whole history, and a history that
nothing purges only grows. Where that count sits on a path every render pays for — a badge in app chrome, a tab
label — add a partial index whose predicate is the filter, so the index is the size of the answer rather than the
size of the table:

```ts
extraConfig: ({ isRead, userId }) => [
  index("foos_userId_createdAt_index").on(userId, sql`"createdAt" DESC`),
  index("foos_userId_isRead_index").on(userId).where(sql`${isRead} = false`),
],
```

**Spell the predicate exactly as the query spells it** (`= false` against an `eq(column, false)` filter, not
`NOT column`): matching a differently-phrased predicate costs the planner an implication proof it may decline,
and a partial index the planner will not use is a write cost with no read benefit. The predicate's column joins
the index name, per the naming rule under "Naming".

This is not speculative tuning — it is the read pattern being known and fixed. A count whose subset is unbounded
(no filter, or a filter matching most rows) gets no partial index; it is already the composite index's job.

Renaming any of these is a metadata-only migration (`ALTER TABLE … RENAME CONSTRAINT`, `ALTER INDEX … RENAME TO`), so consistency here never costs data. Express it to drizzle-kit as an explicit rename rather than letting it infer a drop and recreate — see `references/migrations.md`.

## CHECK constraints with `sql` template literals

- **A length, a minimum, a range or a name bound is a `create*CheckSql` helper** from `packages/db-schema/src/services/shared/`, the folder being the list of bounds one exists for — never the predicate spelled inline. Each renders exactly the string an inline check would, so moving one in costs no migration: `check("users_name_length_check", createNameCheckSql(name, USER_NAME_MAX_LENGTH))`.
- A predicate no helper covers is an `sql` template literal — never a raw string.
- **A numeric literal inside one is `sql.raw()`** — bare interpolation makes Drizzle emit a parameterised placeholder (`$1`), invalid in DDL:

  ```ts
  // CORRECT
  check("foos_bars_check", sql`cardinality(${bars}) <= ${sql.raw(MAX_BARS.toString())}`);
  // WRONG — becomes cardinality("bars") <= $1 in DDL
  check("foos_bars_check", sql`cardinality(${bars}) <= ${MAX_BARS}`);
  ```

## An index follows the reads it serves, not the constraint it enforces

A primary key or unique constraint is one index ordered by its own columns, and it answers only a prefix of them. A
room-wide question (`WHERE "roomId" = ?`) over a key led by `userId` has no index at all, and every refresh of it scans
the whole table. The rule, applied to every table a read touches:

- **Lead each composite with the column the hottest reader filters on**, and add an index for any other filter a reader
  uses. `usersToRooms` keeps its primary key on `(userId, roomId)` for "this user's rooms", and gets
  `usersToRooms_roomId_index` for "this room's members".
- **Order the trailing columns by the read's `ORDER BY`**, with a `DISTINCT ON` key first, so the planner needs no sort:
  `usersToRoomRoles_roomId_userId_index` serves the top-role query's `DISTINCT ON (userId)`.
- **A foreign key gets no index in Postgres.** Index every foreign key whose parent's delete cascades through it, or whose
  children a read filters by: `posts_userId_ranking_index` serves an author's feed and the cascade of a user's deletion.
- **A composite that starts with a column another index already leads with is redundant.** Replace the single-column
  index rather than keep both; the composite answers its filter.

Adding a query means checking its filter and its order against the index list of each table it reads, in the same change.

## A counter is non-negative unless its sign is the domain

A count the server adjusts (`posts.commentCount`) gets `createMinimumCheckSql(count, 0)`: no write in a correct
transaction takes it below zero, so a negative value is a bug the database should refuse. A signed sum is not a count:
`posts.likeCount` sums votes of `-1` and `1`, so it has no bound, and its check is the vote's own
(`likes_value_check`). Never add a `>= 0` check to a column whose sign is the domain.

## Index creation on a populated table

This repository's migrations run before any production data exists, so the generated `CREATE INDEX` is plain. Once a table
holds production rows, a plain `CREATE INDEX` takes a write lock for the length of the build, and the migration for that
index uses `CREATE INDEX CONCURRENTLY` (in a migration with no transaction) instead. Revisit this rule at the first
production migration.
