# @esposter/web

[![Apache-2.0 licensed][badge-license]][url-license]

The main Esposter web application — a Nuxt full-stack app serving the frontend, tRPC API, and server routes.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- ⌨️ [Commands](#commands)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

From the **repo root**, install dependencies and build workspace packages first:

```bash
pnpm i
vp run build:packages
```

Then from `apps/web/`:

```bash
# Copy and fill in environment variables
cp .env.example .env

# Start the development server on http://localhost:3000
pnpm dev
```

### Prerequisites

- Node.js at the root `.node-version`, and pnpm at the root `package.json`'s `packageManager` version
- [PostgreSQL](https://www.postgresql.org/download) + PgAdmin (local DB)
- Azure credentials in `.env` for Table Storage, Blob, WebPubSub, and EventGrid (mocked locally via `azure-mock`)

### Database

Migrations live in `server/db/migrations/` and are generated from `packages/db-schema`:

```bash
# From packages/db-schema/
pnpm db:gen     # generate migration SQL from schema changes
pnpm db:up      # upgrade snapshot metadata to a newer drizzle-kit format
pnpm db:studio  # open Drizzle Studio UI
```

Pending migrations are applied by `pnpm --filter @esposter/db-schema db:migrate`: `pnpm dev` runs it first, and it is the deploy's pre-deploy step.

## <a name="commands">⌨️ Commands</a>

All commands run from `apps/web/`:

```bash
pnpm build            # production build
pnpm dev              # start dev server (http://localhost:3000)
pnpm preview          # preview production build locally
pnpm start            # run the built server (.output), reading .env when present
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=0b6ac0
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
