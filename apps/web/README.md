# @esposter/web

[![Apache-2.0 licensed][badge-license]][url-license]

The main Esposter web application — a Nuxt full-stack app serving the frontend, tRPC API, and server routes.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⌨️ [Commands](#commands)
- 🔗 [Related Documentation](#related)
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

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/tree/main/openspec/specs) to level up.

### Tech Stack

| Layer      | Technology                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| API        | [tRPC](https://trpc.io/docs) via `trpc-nuxt-module`                                                                                                                                              |
| Auth       | [better-auth](https://www.better-auth.com/docs)                                                                                                                                                  |
| Database   | [Drizzle ORM](https://orm.drizzle.team/docs/overview) ([PostgreSQL](https://www.postgresql.org/docs/current/))                                                                                   |
| Framework  | [Nuxt](https://nuxt.com/docs)                                                                                                                                                                    |
| Linting    | [Oxlint](https://oxc.rs/docs/guide/usage/linter) + ESLint                                                                                                                                        |
| Real-time  | [Azure WebPubSub](https://learn.microsoft.com/azure/azure-web-pubsub/overview) + NodeJS EventEmitter                                                                                             |
| State      | [Pinia](https://pinia.vuejs.org/)                                                                                                                                                                |
| Storage    | [Azure Table Storage](https://learn.microsoft.com/azure/storage/tables/table-storage-overview), [Azure Blob Storage](https://learn.microsoft.com/azure/storage/blobs/storage-blobs-introduction) |
| Styling    | [UnoCSS](https://unocss.dev/) (Attributify mode)                                                                                                                                                 |
| Testing    | [Vitest](https://vitest.dev/guide/)                                                                                                                                                              |
| UI         | [Vue](https://vuejs.org/guide/introduction.html), [Vuetify 0](https://0.vuetifyjs.com/)                                                                                                          |
| Validation | [Zod](https://zod.dev/)                                                                                                                                                                          |

### App Structure

```text
apps/web/
├── app/
│   ├── assets/           # Styles and static assets the bundler processes
│   ├── components/       # Vue components
│   ├── composables/      # Vue composables
│   ├── layouts/          # Nuxt layouts
│   ├── middleware/       # Nuxt route middleware
│   ├── models/           # Client-side models
│   ├── pages/            # Nuxt file-based routes
│   ├── plugins/          # Nuxt plugins
│   ├── services/         # Client-side services
│   ├── store/            # Pinia stores
│   ├── types/            # Client-side type declarations
│   └── util/             # Client-side utilities
├── public/               # Files served at a fixed URL, see the static-assets standard
├── server/
│   ├── api/              # Nuxt server API routes
│   ├── composables/      # Server-side composables (Azure clients, session)
│   ├── db/               # Drizzle connection and migrations output
│   ├── models/           # Server-side models
│   ├── plugins/          # Nitro plugins (security, web push)
│   ├── services/         # Server-side services (RBAC, moderation, etc.)
│   └── trpc/             # tRPC router definitions
└── shared/
    ├── assets/           # Assets both halves read
    ├── generated/        # Generated code (Phaser, Tiled)
    ├── models/           # Isomorphic models (browser + server)
    ├── services/         # Isomorphic services
    ├── test/             # Vitest setup
    ├── types/            # Global type declarations
    └── util/             # Isomorphic utilities
```

## <a name="commands">⌨️ Commands</a>

All commands run from `apps/web/`:

```bash
pnpm build            # production build
pnpm dev              # start dev server (http://localhost:3000)
pnpm lint             # eslint (check only); oxlint runs once from the repo root
pnpm lint:fix         # eslint --fix (always use this; never fix manually)
pnpm preview          # preview production build locally
pnpm start            # run the built server (.output), reading .env when present
pnpm test             # vitest watch mode (coverage is run from the repo root)
pnpm typecheck        # Nuxt typecheck, then tsrs over the service worker
```

## <a name="related">🔗 Related Documentation</a>

- [Apexcharts](https://apexcharts.com/docs/)
- [Azure Blob Storage](https://learn.microsoft.com/azure/storage/blobs/storage-blobs-introduction)
- [Azure Event Grid](https://learn.microsoft.com/azure/event-grid/overview)
- [Azure Service Bus](https://learn.microsoft.com/azure/service-bus-messaging/service-bus-messaging-overview)
- [Azure Table Storage](https://learn.microsoft.com/azure/storage/tables/table-storage-overview)
- [Azure Web PubSub](https://learn.microsoft.com/azure/azure-web-pubsub/overview)
- [better-auth](https://www.better-auth.com/docs)
- [CodeMirror](https://codemirror.net/docs/)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [LiveKit](https://docs.livekit.io/)
- [MJML](https://documentation.mjml.io/)
- [Oxlint](https://oxc.rs/docs/guide/usage/linter)
- [pdf.js](https://mozilla.github.io/pdf.js/)
- [Phaser](https://phaser.io/learn)
- [Pinia](https://pinia.vuejs.org/)
- [PostgreSQL](https://www.postgresql.org/docs/current/)
- [SuperJSON](https://github.com/flightcontrolhq/superjson)
- [Temporal](https://tc39.es/proposal-temporal/docs/)
- [three.js](https://threejs.org/docs/)
- [Tiptap](https://tiptap.dev/docs)
- [TresJS](https://tresjs.org/)
- [tRPC](https://trpc.io/docs)
- [Vite+](https://viteplus.dev/guide/)
- [Vitest](https://vitest.dev/guide/)
- [Vue](https://vuejs.org/guide/introduction.html)
- [Vue Flow](https://vueflow.dev/)
- [Vuetify 0](https://0.vuetifyjs.com/)
- [Zod](https://zod.dev/)

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
