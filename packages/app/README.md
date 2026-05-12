# @esposter/app

[![Apache-2.0 licensed][badge-license]][url-license]

The main Esposter web application — a Nuxt 4 full-stack app serving the frontend, tRPC API, and server routes.

### Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

From the **repo root**, install dependencies and build workspace packages first:

```bash
pnpm i
pnpm build:packages
```

Then from `packages/app/`:

```bash
# Copy and fill in environment variables
cp .env.example .env

# Start the development server on http://localhost:3000
pnpm dev
```

### Prerequisites

- Node.js `^24.15.0`
- pnpm `^10`
- [PostgreSQL](https://www.postgresql.org/download) + PgAdmin (local DB)
- Azure credentials in `.env` for Table Storage, Blob, WebPubSub, and EventGrid (mocked locally via `azure-mock`)

### Database

Migrations live in `server/db/migrations/` and are generated from `packages/db-schema`:

```bash
# From packages/db-schema/
pnpm db:gen     # generate migration SQL from schema changes
pnpm db:up      # apply pending migrations
pnpm db:studio  # open Drizzle Studio UI
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/) to level up.

### Tech Stack

| Layer      | Technology                                                       |
| ---------- | ---------------------------------------------------------------- |
| Framework  | [Nuxt 4](https://nuxt.com)                                       |
| UI         | [Vue 3.5](https://vuejs.org), [Vuetify 3](https://vuetifyjs.com) |
| Styling    | [UnoCSS](https://unocss.dev) (Attributify mode), Sass            |
| State      | [Pinia](https://pinia.vuejs.org)                                 |
| API        | [tRPC](https://trpc.io) via `trpc-nuxt`                          |
| Validation | [Zod](https://zod.dev)                                           |
| Database   | [Drizzle ORM](https://orm.drizzle.team) (PostgreSQL)             |
| Storage    | Azure Table Storage, Azure Blob Storage                          |
| Real-time  | Azure WebPubSub + NodeJS EventEmitter                            |
| Auth       | [better-auth](https://github.com/better-auth/better-auth)        |
| Testing    | [Vitest](https://vitest.dev)                                     |
| Linting    | Oxlint + ESLint                                                  |

### Commands

All commands run from `packages/app/`:

```bash
pnpm dev              # start dev server (http://localhost:3000)
pnpm build            # production build
pnpm preview          # preview production build locally
pnpm typecheck        # vue-tsc type check
pnpm lint             # oxlint + eslint (check only)
pnpm lint:fix         # oxlint + eslint --fix (always use this; never fix manually)
pnpm test             # vitest watch mode
pnpm coverage         # vitest run --coverage
```

### App Structure

```
packages/app/
├── app/
│   ├── components/       # Vue components
│   ├── composables/      # Vue composables
│   ├── layouts/          # Nuxt layouts
│   ├── middleware/        # Nuxt route middleware
│   ├── models/           # Client-side models
│   ├── pages/            # Nuxt file-based routes
│   ├── plugins/          # Nuxt plugins
│   ├── services/         # Client-side services
│   └── store/            # Pinia stores
├── server/
│   ├── api/              # Nuxt server API routes
│   ├── db/               # Migrations output
│   ├── routes/           # Nuxt server routes
│   ├── services/         # Server-side services (RBAC, moderation, etc.)
│   └── trpc/             # tRPC router definitions
└── shared/
    ├── models/           # Isomorphic models (browser + server)
    ├── services/         # Isomorphic services
    └── types/            # Global type declarations
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
