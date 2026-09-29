# Postgres Schemas and Export Names

Read when adding a table or an enum, choosing where one lives, naming anything drizzle derives from a table, or moving a table to another schema.

## Every table lives in its product area's schema

Nothing is created in `public`. A Postgres schema is a folder: `src/schema/<schema>/` holds `<schema>Schema.ts` (`camelCase.schema("<schema>")`) and that schema's tables, and `src/relations/<schema>/` holds their relation parts. A table joins its schema through the `pgTable` wrapper's `schema` option, and an enum is declared as `<schema>Schema.enum(...)` in the file of the table that declares it.

A table belongs to the product area whose docs own it — the area is the unit a reader already knows, and a schema per area is what a DBA sees in `\dn`:

| Schema         | What belongs in it                                                   |
| -------------- | -------------------------------------------------------------------- |
| `auth`         | a model better-auth or one of its plugins writes                     |
| `social`       | a relationship between two users that no single product owns         |
| `message`      | esbabbler's rooms and everything scoped to one                       |
| `post`         | the post feed                                                        |
| `resource`     | a resource and what hangs off one                                    |
| `storage`      | what every storage container is charged through                      |
| `achievement`  | achievements and their progress                                      |
| `notification` | the bell and the devices it reaches                                  |
| `app`          | app-wide machinery no product owns, such as the dock and rate limits |

A new table goes in the schema of the area that owns it; a new area with tables of its own gets a new folder. The table is read as `<schema>.<table>` in SQL, and its DDL name stays the bare camelCase noun (`users`), since the schema already qualifies it.

## Every name drizzle derives from a table carries its schema

The export is derived from the DDL name and the schema, never chosen, so it can never collide with a local (`const rooms = …`), a row type or a library's name (livekit's `Room`, the `UserStatus` enum), and every reference says where its table lives:

| Derived from `post.posts`  | Name                      |
| -------------------------- | ------------------------- |
| the table                  | `postsInPost`             |
| its file                   | `postsInPost.ts`          |
| the row type               | `PostInPost`              |
| the select schema          | `selectPostInPostSchema`  |
| the relation part and file | `postsInPostRelation`     |
| a `with` shape const       | `PostInPostRelations`     |
| a row type with relations  | `PostInPostWithRelations` |

An enum's export is its DDL name with `Enum` (`roomTypeEnum`), since it shares its name with the TS enum it is built from. `packages/db-schema/src/schema.test.ts` derives the expected export from each table's and enum's own config and fails on any other name, and on anything left in `public`.

A relation key is a name we choose (`user`, `sessionsInAuth`), except where better-auth joins on it: its adapter derives the key from the model name, so the relations between `auth` tables are keyed by the export (`usersInAuth`, `sessionsInAuth`, `accountsInAuth`), and better-auth's model names point at the exports through `apps/web/server/services/auth/authModelOptions.ts`.

## Moving a table or an enum to another schema

A move is a rename drizzle-kit cannot tell from a drop and a create, so it is hinted (`references/migrations.md`, "Renames"): one `{ "type": "rename", "kind": "table", "from": ["<old schema>", "<table>"], "to": ["<new schema>", "<table>"] }` per table and the same with `"kind": "enum"` per enum. The migration it writes is `CREATE SCHEMA` for a new schema and `ALTER … SET SCHEMA` for each move — metadata only, every row and constraint kept — and the grep for `DROP|TRUNCATE|DELETE FROM` that closes a rename expects 0.
