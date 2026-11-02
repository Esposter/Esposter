# @esposter/db-mock

[![Apache-2.0 licensed][badge-license]][url-license]

It provides an in-memory PostgreSQL database factory for tests, for the server environment only. It uses [PGlite](https://github.com/electric-sql/pglite) to start a real Drizzle ORM database with the full Esposter schema applied, so no running Postgres instance is needed.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- 🧩 [Key Exports](#key-exports)
- 📝 [Usage](#usage)
- ⚖️ [License](#license)

---

## <a name="key-exports">🧩 Key Exports</a>

| Export              | Kind     | Purpose                                                                                                         |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `createMockDb`      | function | Boots an in-memory PGlite database from the committed snapshot, as a Drizzle handle with the Esposter relations |
| `SNAPSHOT_FILENAME` | const    | File name of the pre-migrated data directory snapshot, which `pnpm snapshot:gen` produces                       |

## <a name="usage">📝 Usage</a>

`@esposter/db-mock` is a `devDependency`. Import it only in test files:

```ts
import { createMockDb } from "@esposter/db-mock";

const db = await createMockDb();
// db is a fully-typed `Database` (the driver-agnostic drizzle handle) with all Esposter relations applied
```

After a schema change, regenerate the snapshot:

1. Run `pnpm build` in `packages/db-schema/`. The build exits without errors.
2. Run `pnpm snapshot:gen` in `packages/db-mock/`. The output contains `Wrote`.

Install the peer dependencies: `pnpm i -D @electric-sql/pglite @esposter/db-schema drizzle-orm`.

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
