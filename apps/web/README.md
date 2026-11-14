# @esposter/web

[![Apache-2.0 licensed][badge-license]][url-license]

Serves the Esposter frontend, tRPC API and server routes. It is the main web application, built as a Nuxt full-stack app.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- ⌨️ [Commands](#commands)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

1. From the **repo root**, install the dependencies and build the workspace packages:

   ```bash
   pnpm i
   vp run build:packages
   ```

   Check: both commands end without an error.

2. From `apps/web/`, copy the example environment file and fill in its variables:

   ```bash
   # Copy and fill in environment variables
   cp .env.example .env
   ```

   Check: `.env` exists in `apps/web/`.

3. Start the development server:

   ```bash
   # Start the development server on http://localhost:3000
   pnpm dev
   ```

   Check: the development server serves `http://localhost:3000`.

### Prerequisites

- Node.js: the version in the root `.node-version` file.
- pnpm: the version in the `packageManager` field of the root `package.json`.
- [PostgreSQL](https://www.postgresql.org/download) and PgAdmin, for the local database.
- Azure credentials in `.env` for Table Storage, Blob and EventGrid. Locally, `azure-mock` mocks these services.

### Database

Migrations are in `server/db/migrations/`. They are generated from `packages/db-schema`. Run these commands from `packages/db-schema/`:

```bash
# From packages/db-schema/
pnpm db:gen     # generate migration SQL from schema changes
pnpm db:up      # upgrade snapshot metadata to a newer drizzle-kit format
pnpm db:studio  # open Drizzle Studio UI
```

Pending migrations are applied by `pnpm --filter @esposter/db-schema db:migrate`. `pnpm dev` runs this command first. It is also the deploy's pre-deploy step.

## <a name="commands">⌨️ Commands</a>

Run these commands from `apps/web/`:

```bash
pnpm build            # production build
pnpm dev              # start dev server (http://localhost:3000)
pnpm preview          # preview production build locally
pnpm start            # run the built server (.output), reading .env when present
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
