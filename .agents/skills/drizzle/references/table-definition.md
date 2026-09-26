# Defining a Table

Read when adding or editing a table, a column or a join table in `packages/db-schema/src/schema/`. The one-line rules are in `SKILL.md`; this page is their full statement.

## Column names

**Never pass a name string to a column builder** — call it bare (`no-restricted-syntax`). Casing is handled centrally: the `pgTable` wrapper builds through drizzle's `camelCase` helper (`packages/db-schema/src/pgTable.ts`), and `messageSchema` is `camelCase.schema("message")`, so the DB column name is the camelCase property key automatically.

```ts
barId: text().notNull(), // not text("barId"), never "bar_id"
isHidden: boolean().notNull().default(false),
```

## Tables

- Use the `pgTable` wrapper from `#src/pgTable` (not raw `drizzle-orm/pg-core`) for all tables, including join tables. Pass composite PKs via `extraConfig`.
- **Every DB identifier is camelCase** — table names, enum names, constraint and index names alike (`pgTable("roomCategories")`, `pgEnum("resourceType")`). The name string is the literal DDL identifier: the wrapper's `camelCase` casing applies to **columns**, and passes the table name through untouched, so nothing normalises it for you and nothing catches a snake_case one at compile time — `packages/db-schema/src/schema.test.ts` asserts each table's name equals its exported const instead.
- Pass `schema: messageSchema` for message-feature tables to group them under the `message` Postgres schema. Tables shared beyond the messaging feature (`friends`, `users`, `posts`, `blocks`) take no `schema` and land in the default schema.
- **A column holding another table's id gets `.references()`** — the constraint is what makes the impossible state unrepresentable, so it is the default rather than a decision. Pick the `onDelete` the domain means (`cascade` where the row is meaningless without its parent, `set null` where the row is an audit record that outlives it — `bans.bannedByUserId`), and never `restrict` on a parent something outside this repo deletes, because that turns their delete into a failure. **The one column without a reference is `resources.boundResourceId`**: it is projected from user-authored content on every save, so `set null` on the target's deletion would make the next save of that content rewrite the dangling id and fail on the constraint — the row would be stranded by the very save that keeps it alive. A binding re-resolved on read fails soft instead, and stays a bare id. A pre-existing row the new column cannot fill is settled in the migration (`references/migrations.md`).
- **Each table writes its own column block, even when two tables are twins.** They declare the same columns, the same CHECK and the same indexes, and they still each spell them out. This is the one place the no-duplication rule does not reach: the file is the schema of record, drizzle-kit diffs exactly what it finds there to emit a migration, and a column builder is a stateful object — shared rather than rebuilt per table it carries the first table's identity into the second. Factor the **predicate** instead where one repeats (`createNameCheckSql`, `createMaxLengthCheckSql`, `createMinimumCheckSql` in `services/shared/`), never the columns.
- **Tests fighting a new reference are reporting their own fixtures.** A suite that fabricates ids nothing stored goes red across every write path the moment the constraint lands; the constraint is right, and the double is what changes (`.agents/skills/testing/references/fabricated-ids.md`). Dropping the reference to get a green suite keeps the state it was there to forbid.

```ts
export const foosInMessage = pgTable("foos", { id: uuid().primaryKey().defaultRandom(), ... }, { schema: messageSchema });
```
