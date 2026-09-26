# Queries

Read when writing a read or a write against the database — the select shape, relational against SQL-style, a self-join, a batch insert. The one-line rules are in `SKILL.md`; this page is their full statement.

## Selects

- **`getColumns(table)` (from `drizzle-orm`) for flat results** — extracts only column definitions. Use when joining and you want one table's columns flat: `.select(getColumns(users))`. Never spread the table object directly (`{ ...users }`) — it carries metadata beyond columns.
- **`.select({ alias: tableObject })` for namespaced results** — `.select({ user: users })` → `{ user: User }`, then `.map(({ user }) => user)` to unwrap.
- **`.select()` with no args only when selecting all columns from the FROM table** — adding joins with bare `.select()` mixes joined columns in, losing type clarity.

## Relational vs SQL-style

- **Prefer the relational API (`db.query.table.findFirst/findMany`) by default** — more readable, type-safe, supports eager loading via `with:`. Use for all reads unless a reason forces SQL-style.
- **Use SQL-style (`db.select/update/delete/insert`) only when necessary**: all mutations (`insert`/`update`/`delete` are SQL-style only); complex `OR` join conditions spanning multiple FK columns; aggregations (`db.select({ count: count() }).from(...)`); `onConflictDoNothing` / `onConflictDoUpdate`.
- **Never use number literals for `limit:`** (`no-restricted-syntax` on a `findMany`/`findFirst`) — use `MAX_READ_LIMIT` from `@esposter/shared` or `DEFAULT_READ_LIMIT` from `#shared/services/pagination/constants`.
- `.map()` to unwrap `with:` results is intentional — Drizzle always nests them.

## Self-joins

Always use `alias()` for both references — never the raw table object for either side. Name variables and alias strings `foo1`, `foo2`, etc. (numeric suffix, no role-based names):

```ts
const foos1 = alias(foos, "foos1");
const foos2 = alias(foos, "foos2");
ctx.db.from(foos1).innerJoin(foos2, eq(foos2.barId, foos1.barId));
```

## Batch inserts

Always batch over an array — never loop individual `INSERT`s:

```ts
// CORRECT — one INSERT with multiple rows
await tx
  .insert(foos)
  .values(ids.map((id) => ({ id, parentId })))
  .onConflictDoNothing();
```
