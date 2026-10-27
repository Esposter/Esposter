# @esposter/db-schema

[![Apache-2.0 licensed][badge-license]][url-license]

Drizzle ORM schemas, relations, and migrations for Esposter's PostgreSQL database, the source of truth for all relational data and usable in both browser and server environments.

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
| `Database`           | type     | The driver-agnostic Drizzle handle, typed with the Esposter relations                                 |
| `DataExportStatus`   | enum     | Lifecycle state of a user data export: Queued, Building, Ready or Failed                              |
| `checkHasPermission` | function | Whether a permission bitfield grants a permission; the room owner and the Administrator bit always do |
| `createNameSchema`   | function | Zod schema for a name: normalized, then one to `maxLength` characters                                 |
| `getMimeCategory`    | function | Maps a raw mimetype to image, video, audio or document                                                |
| `pgTable`            | function | Declares a table with the standard `createdAt`, `deletedAt` and `updatedAt` columns added             |
| `relations`          | const    | Every table's relations in one object, passed to Drizzle so `db.query` resolves                       |
| `schema`             | const    | Every table and enum, keyed by its export name                                                        |
| `usersInAuth`        | const    | The `auth.users` table, one row per user account                                                      |

## <a name="usage">📝 Usage</a>

```ts
import type { Database } from "@esposter/db-schema";

import { usersInAuth } from "@esposter/db-schema";

export const countUsers = (db: Database) => db.$count(usersInAuth);
```

## <a name="migrations">🗃️ Migrations</a>

After editing a schema file, generate the migration with `pnpm db:gen`. Migrations are output to `apps/web/server/db/migrations/` and applied by `pnpm --filter @esposter/db-schema db:migrate`, which `pnpm dev` runs first and the deploy's pre-deploy step runs too.

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=0b6ac0
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
