# Contributing to Esposter

Thanks for taking the time to contribute!

## Setup

1. [Fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) the [`Esposter/Esposter`](https://github.com/Esposter/Esposter) repository and clone it locally.
2. Install [Node.js](https://nodejs.org/en) `^24.15.0` and [pnpm](https://pnpm.io) `^10`.
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Copy the env file and fill in values:
   ```bash
   cp packages/app/.env.example packages/app/.env
   ```
5. Start the dev server (from `packages/app/`):
   ```bash
   pnpm dev
   ```

Alternatively, use Docker:

```bash
pnpm build:docker
pnpm dev:docker
```

## Monorepo Structure

| Package                    | Description                                             |
| :------------------------- | :------------------------------------------------------ |
| `packages/app`             | Main Nuxt 4 application (frontend, server routes, tRPC) |
| `packages/azure-functions` | Serverless backend (Azure Event Grid, timers)           |
| `packages/db-schema`       | Drizzle ORM schemas and migrations (source of truth)    |
| `packages/db`              | Database connection logic                               |
| `packages/shared`          | Shared TypeScript types, utilities, and constants       |
| `packages/configuration`   | Shared ESLint, Prettier, and TSConfig                   |
| `packages/vue-phaserjs`    | Phaser game engine Vue integration                      |
| `packages/azure-mock`      | Mock Azure services for local dev and testing           |

## Commands

All commands run from `packages/app/` unless noted.

```bash
pnpm dev              # start dev server
pnpm typecheck        # type check (vue-tsc)
pnpm lint             # check linting (oxlint + eslint)
pnpm lint:fix         # auto-fix linting — always use this, never fix manually
pnpm test             # vitest watch mode
pnpm coverage         # vitest with coverage report
```

From the **repo root**:

```bash
pnpm build            # build all packages then the app
pnpm test             # run all package tests
pnpm typecheck        # typecheck all packages
```

From `packages/db-schema/`:

```bash
pnpm db:gen           # generate migration from schema changes
pnpm db:up            # apply pending migrations
pnpm db:studio        # open Drizzle Studio UI
```

## Database Migrations

When you change a schema file in `packages/db-schema/src/schema/`:

1. Run `pnpm db:gen` to generate the migration SQL.
2. Run `pnpm db:up` to apply it locally.
3. If you added or removed exports, run `pnpm export:gen` in `packages/db-schema/`.

## Before You Start

- **Bug fixes** — check whether an [existing issue](https://github.com/Esposter/Esposter/issues) already describes the bug.
- **Features** — open a feature request issue first. Wait for a maintainer to confirm before building.
- **Typos** — batch multiple fixes into a single PR.

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org):

```
<type>: <description>
```

| Type       | When                                          |
| :--------- | :-------------------------------------------- |
| `feat`     | New feature                                   |
| `fix`      | Bug fix                                       |
| `refactor` | Code change that is neither a fix nor feature |
| `perf`     | Performance improvement                       |
| `test`     | Adding or updating tests                      |
| `docs`     | Documentation only                            |
| `chore`    | Tooling, config, dependencies                 |
| `ci`       | CI/CD changes                                 |

Scope monorepo commits where helpful: `feat(db-schema): add createdAt to posts`.

## Pull Requests

1. Create a branch from `main`: `git checkout -b my-feature`
2. Make your changes and ensure all checks pass:
   ```bash
   pnpm lint:fix && pnpm typecheck && pnpm test
   ```
3. Push and open a PR against `main`.
4. PR description should explain **what** changed and **why**.

Pre-commit hooks run the formatter automatically via [nano-staged](https://github.com/usmanyunusov/nano-staged), so committed code is always formatted.

## Code Style

- **TypeScript strict mode** — no `any`, no non-null assertions (`!`), no `Omit`.
- **Immutability** — create new objects/arrays, never mutate in place.
- **One export per file** — classes in `models/`, functions in `services/`, constants in `constants.ts`.
- **No comments** unless the _why_ is non-obvious (hidden constraints, workarounds).
- **No `console.log`** in committed code.
- Use `pnpm lint:fix` — never fix lint errors by hand.

## License

By contributing, you agree that your contributions will be licensed under the [Apache 2.0 License](LICENSE).
