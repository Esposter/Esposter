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
- Cloudflare values in `.env` for R2 presigned URLs and RealtimeKit: `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `REALTIMEKIT_APP_ID` and `REALTIMEKIT_API_TOKEN`.
- The local D1 database needs no account. `pnpm dev` applies its migrations with wrangler.

### Database

Migrations are in `server/db/migrations/core/`. They are generated from `packages/db-schema`. Run these commands from `packages/db-schema/`:

```bash
# From packages/db-schema/
pnpm db:gen     # generate migration SQL from schema changes
pnpm db:up      # upgrade snapshot metadata to a newer drizzle-kit format
pnpm db:studio  # open Drizzle Studio UI
```

`pnpm dev` applies pending migrations to the local D1 with wrangler. CI's deploy job applies them to the remote D1 with `pnpm --filter @esposter/db-schema db:migrate`.

## <a name="commands">⌨️ Commands</a>

Run these commands from `apps/web/`:

```bash
pnpm build            # production build
pnpm dev              # start dev server (http://localhost:3000)
pnpm preview          # preview production build locally
pnpm start            # run the built Worker (.output) with wrangler dev, reading .env
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
