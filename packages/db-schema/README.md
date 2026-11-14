# @esposter/db-schema

[![Apache-2.0 licensed][badge-license]][url-license]

It provides Drizzle ORM SQLite schemas, relations and migrations for Esposter's D1 database. It is the source of truth for all relational data, and it works in browser and server environments.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- 🧩 [Key Exports](#key-exports)
- 📝 [Usage](#usage)
- 🗃️ [Migrations](#migrations)
- ⚖️ [License](#license)

---

## <a name="key-exports">🧩 Key Exports</a>

| Export               | Kind     | Purpose                                                                                               |
| -------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `Database`           | type     | The Drizzle handle over D1, typed with the Esposter relations                                         |
| `DataExportStatus`   | enum     | Lifecycle state of a user data export: Queued, Building, Ready or Failed                              |
| `checkHasPermission` | function | Whether a permission bitfield grants a permission; the room owner and the Administrator bit always do |
| `createNameSchema`   | function | Zod schema for a name: normalized, then one to `maxLength` characters                                 |
| `getMimeCategory`    | function | Maps a raw mimetype to image, video, audio or document                                                |
| `relations`          | const    | Every table's relations in one object, passed to Drizzle so `db.query` resolves                       |
| `schema`             | const    | Every table and enum, keyed by its export name                                                        |
| `sqliteTable`        | function | Declares a table with the standard `createdAt`, `deletedAt` and `updatedAt` columns added             |
| `usersInAuth`        | const    | The auth `users` table, one row per user account                                                      |

## <a name="usage">📝 Usage</a>

```ts
import type { Database } from "@esposter/db-schema";

import { usersInAuth } from "@esposter/db-schema";

export const countUsers = (db: Database) => db.$count(usersInAuth);
```

## <a name="migrations">🗃️ Migrations</a>

After you edit a schema file, generate the migration:

1. Run `pnpm db:gen` in `packages/db-schema/`.
2. Check the result: the new migration folder appears in `apps/web/server/db/migrations/core/`.

`pnpm db:gen` generates the `core` migrations only. The room, call and user objects have their own SQLite schemas in `apps/functions/src/durableObjects/`. Generate an object's migrations in `packages/db-schema/` with `drizzle-kit generate --config`, naming `drizzle.room.config.ts`, `drizzle.call.config.ts` or `drizzle.user.config.ts`.

`pnpm dev` in `apps/web/` applies the `core` migrations to the local D1 with wrangler. CI's deploy job applies them to the remote D1 with `pnpm --filter @esposter/db-schema db:migrate`.

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
