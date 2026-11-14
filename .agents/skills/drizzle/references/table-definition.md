# Defining a Table

Read when adding or editing a table, a column or a join table in `packages/db-schema/src/schema/`. The one-line rules are in `SKILL.md`; this page is their full statement.

## Column names

**Never pass a name string to a column builder** — call it bare (`no-restricted-syntax`). Casing is handled centrally: `createDatabaseSchema` builds each area's table creator with drizzle's `camelCase` casing (`packages/db-schema/src/createDatabaseSchema.ts`), and the `sqliteTable` wrapper passes every table through it, so the DB column name is the camelCase property key automatically.

```ts
barId: text().notNull(), // not text("barId"), never "bar_id"
isHidden: integer({ mode: "boolean" }).notNull().default(false),
```

## Tables

- Use the `sqliteTable` wrapper from `#src/sqliteTable` (not raw `drizzle-orm/sqlite-core`) for every core table, including join tables. Pass composite PKs via `extraConfig`. The Durable Object schemas and the streams tables build with drizzle-orm's `sqliteTable` directly (`references/durable-object-schemas.md`).
- **Every DB identifier is camelCase** — table names, constraint and index names alike (`sqliteTable("roomCategories", ...)`). The name string is the literal DDL identifier, with the area prefix the wrapper adds: the wrapper's `camelCase` casing applies to **columns**, and passes the table name through untouched, so nothing normalises it for you and nothing catches a snake_case one at compile time — `packages/db-schema/src/schema.test.ts` asserts each table's export is derived from its name instead.
- **Pass the table's product area** through the wrapper's `schema` option — every core table has one, and which one, and what its export is named, is `references/schemas-and-names.md`.
- **A column holding another table's id gets `.references()`** — the constraint is what makes the impossible state unrepresentable, so it is the default rather than a decision. Pick the `onDelete` the domain means (`cascade` where the row is meaningless without its parent, `set null` where the row is an audit record that outlives it — `bans.bannedByUserId`), and never `restrict` on a parent something outside this repo deletes, because that turns their delete into a failure. **A column projected from user-authored content on every save takes no reference** — `resourceLinks.targetId` is one: `set null` on the target's deletion would make the next save of that content rewrite the dangling id and fail on the constraint — the row would be stranded by the very save that keeps it alive. A link re-resolved on read fails soft instead, and stays a bare id. A pre-existing row the new column cannot fill is settled in the migration (`references/migrations.md`).
- **Parallel tables share their column group as a factory function.** The group is a `create*Columns()` function returning fresh builders — `createRoomUserColumns()`, `createResourceUserColumns()`, `createSenderReceiverColumns()` — spread into every table of the group, and `createMetadataSchema()` into every table through the `sqliteTable` wrapper. The reason is the drizzle source (`drizzle-orm/column.js`, `this.config = config`): a column builder keeps its `config` on the builder object, and a table names each column from its key, so a builder reused across tables shares one config. A function gives each table its own builders, and the `.references()` callbacks are re-evaluated per table when its foreign keys are built. Where two parallel tables name a column differently, that is a rename migration (`references/migrations.md`). Factor a repeated predicate with the `create*CheckSql` helpers (`references/table-constraints.md`).
- **Tests fighting a new reference are reporting their own fixtures.** A suite that fabricates ids nothing stored goes red across every write path the moment the constraint lands; the constraint is right, and the double is what changes (the `testing` skill, `references/fabricated-ids.md`). Dropping the reference to get a green suite keeps the state it was there to forbid.

```ts
export const foosInMessage = sqliteTable("foos", { id: text().primaryKey(), ... }, { schema: messageSchema });
```

## Bitfields

A permission bitfield that can outgrow a JS number is a `createBitfieldColumn()` column (`packages/db-schema/src/services/shared/createBitfieldColumn.ts`). It is stored as its decimal text, because D1 hands an integer back as a JS number, which is exact only up to 2^53, while the text reads back exact at any width. Every bitwise operation happens in JS on `bigint`s, never in SQL, so nothing depends on how SQLite converts the text. Its default is written as SQL (`'0'`), since drizzle-kit cannot render a `bigint` default for a custom column. The select schema names the column's type with `z.bigint()` (`packages/db-schema/src/schema/message/roomRolesInMessage.ts`).
