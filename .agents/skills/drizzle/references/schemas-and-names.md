# Table Prefixes and Export Names

Read when adding a table, choosing the product area it lives in, naming anything drizzle derives from a table, or moving a table to another area.

## Every table lives in its product area's prefix

SQLite has no schemas, so a product area is a table-name prefix. A folder is the area: `src/schema/<area>/` holds `<area>Schema.ts` (`createDatabaseSchema("<area>")`, `packages/db-schema/src/createDatabaseSchema.ts`) and that area's tables, and `src/relations/<area>/` holds their relation parts. A table joins its area through the `sqliteTable` wrapper's `schema` option, and the wrapper names it `<area>_<table>` in D1 (`message_rooms`). Every core table shares one D1 database, so the prefix keeps each name unique across the folders.

An enum is not a database object. A TS enum is held on its column through `createEnumColumn(SomeEnum)` (`packages/db-schema/src/services/shared/createEnumColumn.ts`), and its values are stored as text.

A table belongs to the product area whose docs own it — the area is the unit a reader already knows, and the prefix is what a reader sees in the migration SQL:

| Area           | What belongs in it                                                   |
| -------------- | -------------------------------------------------------------------- |
| `auth`         | a model better-auth or one of its plugins writes                     |
| `social`       | a relationship between two users that no single product owns         |
| `message`      | esbabbler's rooms and everything scoped to one                       |
| `post`         | the post feed                                                        |
| `resource`     | a resource and what hangs off one                                    |
| `storage`      | what every storage bucket is charged through                         |
| `achievement`  | achievements and their progress                                      |
| `notification` | the bell and the devices it reaches                                  |
| `user`         | a person's own records no other area owns, such as a data export     |
| `app`          | app-wide machinery no product owns, such as the dock and rate limits |

A new table goes in the area that owns it; a new area with tables of its own gets a new folder. The table's DDL name is `<area>_<table>` (`auth_users`), so the bare camelCase noun is the `<table>` part, and `schema.test.ts` derives the export from the full name.

## Every name drizzle derives from a table carries its area

The export is derived from the DDL name, never chosen, so it can never collide with a local (`const rooms = …`), a row type or a name another module already exports (the `UserStatus` enum), and every reference says where its table lives:

| Derived from the table `posts` in `post` | Name                      |
| ---------------------------------------- | ------------------------- |
| the table                                | `postsInPost`             |
| its file                                 | `postsInPost.ts`          |
| the row type                             | `PostInPost`              |
| the select schema                        | `selectPostInPostSchema`  |
| the relation part and file               | `postsInPostRelation`     |
| a `with` shape const                     | `PostInPostRelations`     |
| a row type with relations                | `PostInPostWithRelations` |

`packages/db-schema/src/schema.test.ts` derives the expected export from each table's own config and fails on any other name, and on a table whose DDL name carries no area prefix.

A relation key is a name we choose (`user`, `sessionsInAuth`), except where better-auth joins on it: its adapter derives the key from the model name, so the relations between `auth` tables are keyed by the export for a join to one row (`usersInAuth`) and by the export plus `s` for a join to many (`accountsInAuths`), and better-auth's model names point at the exports through `apps/web/server/services/auth/authModelOptions.ts`.

## Moving a table to another area

A move changes the DDL name's prefix, which drizzle-kit cannot tell from a drop and a create, so it is hinted as a table rename (`references/migrations.md`, "Renames"). The migration it writes is `ALTER TABLE … RENAME TO`, metadata only, with every row and constraint kept, and the grep for `DROP TABLE|DELETE FROM` that closes a rename expects 0.
