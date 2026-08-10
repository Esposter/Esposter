# @esposter/db-mock

[![Apache-2.0 licensed][badge-license]][url-license]

In-memory PostgreSQL database factory for testing — server environment only. Uses [PGlite](https://github.com/electric-sql/pglite) to spin up a real Drizzle ORM database with the full Esposter schema applied, without needing a running Postgres instance.

## Table of Contents

- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/api/modules/_esposter_db-mock.html) to level up.

### Usage

`@esposter/db-mock` is a `devDependency` — import it only in test files:

```ts
import { createMockDb } from "@esposter/db-mock";

const db = await createMockDb();
// db is a fully-typed PostgresJsDatabase with all Esposter schemas applied
```

### How It Works

`createMockDb()` does the following on each call:

1. Loads the committed `snapshot.tar.gz` — a data directory already migrated to the current schema — as the PGlite client's `loadDataDir`, with the `pg_trgm` extension the snapshot was dumped with.
2. Awaits `client.waitReady`, so the boot cost lands in `beforeAll` rather than in the first query.
3. Wraps it with a Drizzle ORM instance using the full `relations` config from `@esposter/db-schema`.

Loading a pre-migrated directory skips PGlite's `initdb` and runtime migration generation. Each test gets a fresh, isolated database — no cleanup required.

**A schema change needs the snapshot regenerated**: build `@esposter/db-schema`, then run `pnpm snapshot:gen` here. `createMockDb.test.ts` fails when the committed snapshot has drifted from the schema.

### Peer Dependencies

```bash
pnpm i -D @esposter/db-mock @electric-sql/pglite @esposter/db-schema drizzle-orm
```

### Commands

Run from `packages/db-mock/`:

```bash
pnpm build        # compile to dist/
pnpm snapshot:gen # regenerate snapshot.tar.gz from the current schema
pnpm test         # vitest watch mode
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
