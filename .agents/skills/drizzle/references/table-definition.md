# Defining a Table

Read when adding or editing a table, a column or a join table in `packages/db-schema/src/schema/`. The one-line rules are in `SKILL.md`; this page is their full statement.

## Column names

**Never pass a name string to a column builder** — call it bare (`no-restricted-syntax`). Casing is handled centrally: the `pgTable` wrapper builds through drizzle's `camelCase` helper (`packages/db-schema/src/pgTable.ts`), and every Postgres schema is declared through `camelCase.schema(...)`, so the DB column name is the camelCase property key automatically.

```ts
barId: text().notNull(), // not text("barId"), never "bar_id"
isHidden: boolean().notNull().default(false),
```

## Tables

- Use the `pgTable` wrapper from `#src/pgTable` (not raw `drizzle-orm/pg-core`) for all tables, including join tables. Pass composite PKs via `extraConfig`.
- **Every DB identifier is camelCase** — table names, enum names, constraint and index names alike (`pgTable("roomCategories")`, `resourceSchema.enum("resourceType")`). The name string is the literal DDL identifier: the wrapper's `camelCase` casing applies to **columns**, and passes the table name through untouched, so nothing normalises it for you and nothing catches a snake_case one at compile time — `packages/db-schema/src/schema.test.ts` asserts each table's export is derived from its name instead.
- **Pass the table's Postgres schema** through the wrapper's `schema` option — every table has one, and which one, and what its export is named, is `references/schemas-and-names.md`.
- **A column holding another table's id gets `.references()`** — the constraint is what makes the impossible state unrepresentable, so it is the default rather than a decision. Pick the `onDelete` the domain means (`cascade` where the row is meaningless without its parent, `set null` where the row is an audit record that outlives it — `bans.bannedByUserId`), and never `restrict` on a parent something outside this repo deletes, because that turns their delete into a failure. **A column projected from user-authored content on every save takes no reference** — `resourceLinks.targetId` is one: `set null` on the target's deletion would make the next save of that content rewrite the dangling id and fail on the constraint — the row would be stranded by the very save that keeps it alive. A link re-resolved on read fails soft instead, and stays a bare id. A pre-existing row the new column cannot fill is settled in the migration (`references/migrations.md`).
- **Parallel tables share their column group as a factory function.** The group is a `create*Columns()` function returning fresh builders — `createRoomUserColumns()`, `createResourceUserColumns()`, `createSenderReceiverColumns()` — spread into every table of the group, and `createMetadataSchema()` into every table through the `pgTable` wrapper. The reason is the drizzle source (`drizzle-orm` `pg-core/table.js`): table construction writes each column's name onto its builder's `config` from its key, and building the column returns one whose `config` is the builder's own object (`column.js`, `this.config = config`), so a builder reused across tables shares one config. A function gives each table its own builders, and the `.references()` callbacks are re-evaluated per table when its foreign keys are built. Where two parallel tables name a column differently, that is a rename migration (`references/migrations.md`). Factor a repeated predicate with the `create*CheckSql` helpers (`references/table-constraints.md`).
- **Tests fighting a new reference are reporting their own fixtures.** A suite that fabricates ids nothing stored goes red across every write path the moment the constraint lands; the constraint is right, and the double is what changes (the `testing` skill, `references/fabricated-ids.md`). Dropping the reference to get a green suite keeps the state it was there to forbid.

```ts
export const foosInMessage = pgTable("foos", { id: uuid().primaryKey().defaultRandom(), ... }, { schema: messageSchema });
```
