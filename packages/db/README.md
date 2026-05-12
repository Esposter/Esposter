# @esposter/db

[![Apache-2.0 licensed][badge-license]][url-license]

Database connection utilities for Esposter — server environment only. Provides composables for Drizzle ORM (PostgreSQL), Azure Table Storage, Azure Blob Storage, Azure AI Search, and Azure WebPubSub.

### Table of Contents

- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/) to level up.

### What's Included

| Composable / Service | Description                                                             |
| -------------------- | ----------------------------------------------------------------------- |
| Drizzle (PostgreSQL) | `drizzle-orm` client wired to the `DATABASE_URL` connection string      |
| Azure Table Storage  | `useTableClient` — creates a typed `TableClient` for a given table name |
| Azure Blob Storage   | `useBlobServiceClient` — creates a `BlobServiceClient`                  |
| Azure AI Search      | `useSearchIndexClient` — creates a typed `SearchIndexClient`            |
| Azure WebPubSub      | `useWebPubSubServiceClient` — creates a `WebPubSubServiceClient`        |
| Link preview         | `getLinkPreview` — fetches Open Graph metadata from a URL               |

### Architecture Notes

- **Server-only**: this package must not be imported in browser code.
- Depends on `@esposter/db-schema` for Drizzle relation and schema definitions.
- Azure clients are instantiated with `DefaultAzureCredential` — no hardcoded secrets.

### Commands

Run from `packages/db/`:

```bash
pnpm build        # compile to dist/
pnpm test         # vitest watch mode
pnpm coverage     # vitest run --coverage
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
