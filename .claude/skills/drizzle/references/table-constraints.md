# Constraints and indexes

Read when adding a CHECK constraint, unique constraint or index to a table.

## Naming

Always explicit, descriptive names — never bare column names like `"name"` or `"position"`. Underscores between components; the `{table}` component is the snake_case table name, but the `{column}` components keep their camelCase.

| Type              | Pattern                         | Example                                       |
| ----------------- | ------------------------------- | --------------------------------------------- |
| Length check      | `{table}_{column}_length_check` | `"users_name_length_check"`                   |
| Other check       | `{table}_{column}_check`        | `"room_categories_position_check"`            |
| Semantic check    | descriptive phrase              | `"no_self_block"`, `"rooms_name_check"`       |
| Unique constraint | `{table}_{col1}_{col2}_unique`  | `"push_subscriptions_endpoint_userId_unique"` |
| Index             | `{table}_{col}_index`           | `"blocks_blockedId_index"`                    |
| Composite index   | `{table}_{col1}_{col2}_index`   | `"room_roles_roomId_position_index"`          |

## CHECK constraints with `sql` template literals

- Always use ` sql` `` template literals — never a raw string.
- **Numeric literals MUST use `sql.raw()`** — bare interpolation makes Drizzle emit a parameterised placeholder (`$1`), invalid in DDL:

  ```ts
  // CORRECT
  check("name", sql`LENGTH(${name}) <= ${sql.raw(NAME_MAX_LENGTH.toString())}`);
  // WRONG — becomes LENGTH("name") <= $1 in DDL
  check("name", sql`LENGTH(${name}) <= ${NAME_MAX_LENGTH}`);
  ```

- Use `BETWEEN` when a column has both a lower and upper bound:

  ```ts
  check("name", sql`LENGTH(${name}) BETWEEN 1 AND ${sql.raw(NAME_MAX_LENGTH.toString())}`);
  ```
