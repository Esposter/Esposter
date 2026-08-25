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
the index name, per the rule above.

This is not speculative tuning — it is the read pattern being known and fixed. A count whose subset is unbounded
(no filter, or a filter matching most rows) gets no partial index; it is already the composite index's job.

Renaming any of these is a metadata-only migration (`ALTER TABLE … RENAME CONSTRAINT`, `ALTER INDEX … RENAME TO`), so consistency here never costs data. Express it to drizzle-kit as an explicit rename rather than letting it infer a drop and recreate — see `references/migrations.md`.

## CHECK constraints with `sql` template literals

- Always use `sql` template literals — never a raw string.
- **Numeric literals MUST use `sql.raw()`** — bare interpolation makes Drizzle emit a parameterised placeholder (`$1`), invalid in DDL:

  ```ts
  // CORRECT
  check("users_name_length_check", sql`LENGTH(${name}) <= ${sql.raw(NAME_MAX_LENGTH.toString())}`);
  // WRONG — becomes LENGTH("name") <= $1 in DDL
  check("users_name_length_check", sql`LENGTH(${name}) <= ${NAME_MAX_LENGTH}`);
  ```

- Use `BETWEEN` when a column has both a lower and upper bound:

  ```ts
  check("users_name_length_check", sql`LENGTH(${name}) BETWEEN 1 AND ${sql.raw(NAME_MAX_LENGTH.toString())}`);
  ```
