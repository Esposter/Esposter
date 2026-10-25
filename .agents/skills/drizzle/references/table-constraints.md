# Constraints

Read when adding a CHECK constraint or a unique constraint, or naming a constraint or index. Index design is `references/indexes.md`.

## Naming

One rule, no exceptions: **`{table}_{column…}_{qualifier…}_{kind}`**, where every component is the DDL identifier verbatim — so camelCase throughout — and `_` is only ever the separator between components. `kind` is `check`, `unique` or `index`. Always explicit and descriptive; never a bare column name like `"name"` or `"position"`.

| Type              | Pattern                         | Example                                      |
| ----------------- | ------------------------------- | -------------------------------------------- |
| Length check      | `{table}_{column}_length_check` | `"users_name_length_check"`                  |
| Other check       | `{table}_{column}_check`        | `"roomCategories_position_check"`            |
| Multi-column      | `{table}_{col1}_{col2}_check`   | `"invites_uses_maxUses_check"`               |
| Unique constraint | `{table}_{col1}_{col2}_unique`  | `"pushSubscriptions_userId_endpoint_unique"` |
| Index             | `{table}_{col}_index`           | `"blocks_blockedId_index"`                   |
| Composite index   | `{table}_{col1}_{col2}_index`   | `"roomRoles_roomId_position_index"`          |

**There is no "semantic name" escape.** A constraint whose meaning reads better as a phrase (`no_self_block`) still names its table and columns, because the phrase is the one thing the error message cannot tell you — `blocks_blockerId_blockedId_check` says where to look, and the `sql` body says what it forbids. A partial index names the predicate's column too (`roomRoles_roomId_isEveryone_unique`), so two partial uniques on one column stay distinguishable.

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

## A counter is non-negative unless its sign is the domain

A count the server adjusts (`posts.commentCount`) gets `createMinimumCheckSql(count, 0)`: no write in a correct
transaction takes it below zero, so a negative value is a bug the database should refuse. A signed sum is not a count:
`posts.likeCount` sums votes of `-1` and `1`, so it has no bound, and its check is the vote's own
(`likes_value_check`). Never add a `>= 0` check to a column whose sign is the domain.
