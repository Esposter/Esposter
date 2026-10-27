# @esposter/db-schema

[![Apache-2.0 licensed][badge-license]][url-license]

Drizzle ORM schemas, relations, and migrations for Esposter's PostgreSQL database, the source of truth for all relational data and usable in both browser and server environments.

## Table of Contents

- 📖 [Documentation](#documentation)
- ⌨️ [Commands](#commands)
- 🔗 [Related Documentation](#related)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/tree/main/openspec/specs) to level up.

### Key Exports

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

### Usage

```ts
import type { Database } from "@esposter/db-schema";

import { usersInAuth } from "@esposter/db-schema";

export const countUsers = (db: Database) => db.$count(usersInAuth);
```

### Migration Workflow

After editing a schema file, generate the migration with `pnpm db:gen` (see Commands). Migrations are output to
`apps/web/server/db/migrations/` and are applied by `pnpm --filter @esposter/db-schema db:migrate`, which `pnpm dev` runs first and the deploy's pre-deploy step runs too.

### Schema Layout

One file per table in `src/schema/`, named after the table it declares, and every one of them — plus every
`pgEnum` — registered in the generated registry `src/generated/schema.ts`, which `pnpm registry:gen` writes from
those files so no list is kept by hand. `drizzle-kit` reads the `src/schema/**/*.ts` glob from `drizzle.config.ts`,
and the files under `src/schema/` are the table list.

What the tree does not say is the split: Postgres holds relational data, while message **content** lives in
Azure Table Storage, so a `messages` row is metadata and its body is not in this package at all.

### Conventions

- Use the `pgTable` wrapper (re-exported from this package), **not** raw drizzle `pgTable` — the wrapper adds standard metadata columns.
- Columns use camelCase property names matching TypeScript properties.
- All `z.discriminatedUnion` schemas must end with `satisfies z.ZodType<UnionType>`.
- Each model file holds exactly one interface/class and one schema.

## <a name="commands">⌨️ Commands</a>

Run from `packages/db-schema/`:

```bash
pnpm build        # compile to dist/
pnpm db:gen       # generate migration SQL from schema changes
pnpm db:migrate   # apply the generated migrations to the database
pnpm db:pull      # pull the schema from the database
pnpm db:studio    # open Drizzle Studio UI for visual inspection
pnpm db:up        # upgrade snapshot metadata to a newer drizzle-kit format
pnpm lint         # check
pnpm lint:fix     # auto-fix lint
pnpm registry:gen # regenerate the schema and relation registries in src/generated/
pnpm test         # vitest watch mode
pnpm typecheck    # type check
```

## <a name="related">🔗 Related Documentation</a>

- [Azure Blob Storage](https://learn.microsoft.com/azure/storage/blobs/storage-blobs-introduction)
- [Azure Event Grid](https://learn.microsoft.com/azure/event-grid/overview)
- [Azure Table Storage](https://learn.microsoft.com/azure/storage/tables/table-storage-overview)
- [Drizzle Kit](https://orm.drizzle.team/docs/kit-overview)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Vitest](https://vitest.dev/guide/)
- [Zod](https://zod.dev/)

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
