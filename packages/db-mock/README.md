# @esposter/db-mock

[![Apache-2.0 licensed][badge-license]][url-license]

In-memory PostgreSQL database factory for testing, server environment only: it uses [PGlite](https://github.com/electric-sql/pglite) to spin up a real Drizzle ORM database with the full Esposter schema applied, without needing a running Postgres instance.

## Table of Contents

- 📖 [Documentation](#documentation)
- ⌨️ [Commands](#commands)
- 🔗 [Related Documentation](#related)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/tree/main/openspec/specs) to level up.

### Key Exports

| Export              | Kind     | Purpose                                                                                                         |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `createMockDb`      | function | Boots an in-memory PGlite database from the committed snapshot, as a Drizzle handle with the Esposter relations |
| `SNAPSHOT_FILENAME` | const    | File name of the pre-migrated data directory snapshot, which `pnpm snapshot:gen` produces                       |

### Usage

`@esposter/db-mock` is a `devDependency` — import it only in test files:

```ts
import { createMockDb } from "@esposter/db-mock";

const db = await createMockDb();
// db is a fully-typed `Database` (the driver-agnostic drizzle handle) with all Esposter relations applied
```

### How It Works

`createMockDb()` does the following on each call:

1. Loads the committed `snapshot.tar.gz` — a data directory already migrated to the current schema — as the PGlite client's `loadDataDir`, with the `pg_trgm` extension the snapshot was dumped with.
2. Awaits `client.waitReady`, so the boot cost lands in `beforeAll` rather than in the first query.
3. Wraps it with a Drizzle ORM instance using the full `relations` config from `@esposter/db-schema`.

Loading a pre-migrated directory skips PGlite's `initdb` and runtime migration generation. Each test gets a fresh, isolated database — no cleanup required.

**A schema change needs the snapshot regenerated**: build `@esposter/db-schema`, then run `pnpm snapshot:gen` here. `createMockDb.test.ts` fails when the committed snapshot has drifted from the schema.

### Peer Dependencies

`@esposter/db-mock` is private and is used from inside the workspace, not installed from npm. Its peers are:

```bash
pnpm i -D @electric-sql/pglite @esposter/db-schema drizzle-orm
```

## <a name="commands">⌨️ Commands</a>

Run from `packages/db-mock/`:

```bash
pnpm build        # compile to dist/
pnpm lint         # check
pnpm lint:fix     # auto-fix lint
pnpm snapshot:gen # regenerate snapshot.tar.gz from the current schema
pnpm test         # vitest watch mode
pnpm typecheck    # type check
```

## <a name="related">🔗 Related Documentation</a>

- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [PGlite](https://pglite.dev/docs/)
- [Vitest](https://vitest.dev/guide/)

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
