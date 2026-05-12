# @esposter/db-mock

[![Apache-2.0 licensed][badge-license]][url-license]

In-memory PostgreSQL database factory for testing — server environment only. Uses [PGlite](https://github.com/electric-sql/pglite) to spin up a real Drizzle ORM database with the full Esposter schema applied, without needing a running Postgres instance.

### Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

`@esposter/db-mock` is a `devDependency` — import it only in test files:

```ts
import { createMockDb } from "@esposter/db-mock";

const db = await createMockDb();
// db is a fully-typed PostgresJsDatabase with all Esposter schemas applied
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/) to level up.

### How It Works

`createMockDb()` does the following on each call:

1. Creates a new PGlite in-memory client.
2. Wraps it with a Drizzle ORM instance using the full `relations` config from `@esposter/db-schema`.
3. Generates migration SQL from the current schema snapshot (via `drizzle-kit/api-postgres`).
4. Applies all generated statements so the schema is up to date.

Each test gets a fresh, isolated database — no cleanup required.

### Peer Dependencies

```bash
pnpm i -D @esposter/db-mock @electric-sql/pglite drizzle-kit drizzle-orm @esposter/db-schema
```

### Commands

Run from `packages/db-mock/`:

```bash
pnpm build        # compile to dist/
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
