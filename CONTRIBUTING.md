# Contributing to Esposter

Thanks for taking the time to contribute!

## Setup

1. [Fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) the [`Esposter/Esposter`](https://github.com/Esposter/Esposter) repository and clone it locally.
2. Install [Node.js](https://nodejs.org/en) at the version `engines.node` in the root `package.json` asks for, and [pnpm](https://pnpm.io) at the `packageManager` version beside it.
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

## Monorepo Structure

Esposter is a pnpm workspaces monorepo. Every package, what it holds and whether it is published are in the [package table](README.md#packages), and each package's own `README.md` covers it in full.

## Commands

All commands run from `packages/app/` unless noted.

```bash
pnpm dev              # start dev server
pnpm typecheck        # type check (vue-tsc)
pnpm lint             # check linting (eslint; oxlint runs as one pass from the repo root)
pnpm lint:fix         # auto-fix linting — always use this, never fix manually
pnpm test             # vitest watch mode
```

From the **repo root**:

```bash
pnpm build            # build all packages then the app
pnpm test             # run all package tests
pnpm typecheck        # typecheck all packages
pnpm coverage         # run every project's tests with coverage
```

From `packages/db-schema/`:

```bash
pnpm db:gen           # generate migration SQL from schema changes
pnpm db:up            # upgrade snapshot metadata to a newer drizzle-kit format
pnpm db:studio        # open Drizzle Studio UI
```

## Database Migrations

When you change a schema file in `packages/db-schema/src/schema/`:

1. Run `pnpm db:gen` to generate the migration SQL.
2. Start the app — migrations are applied at startup by the Nitro plugin `packages/app/server/plugins/migrate.ts`. Nothing applies them from the CLI, `db:up` included.
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

`develop` is the integration branch and `main` takes releases from it, so contributions target `develop` — a PR against `main` would bypass integration and sit alongside the long-lived release PR.

1. Create a branch from `develop`: `git checkout -b my-feature develop`
2. Make your changes and ensure all checks pass:
   ```bash
   pnpm lint:fix && pnpm typecheck && pnpm test
   ```
3. Push and open a PR against `develop`.
4. PR description should explain **what** changed and **why**.

Pre-commit hooks run the formatter automatically via [nano-staged](https://github.com/usmanyunusov/nano-staged), so committed code is always formatted.

## Code Style

- **TypeScript strict mode** — no `any`, no non-null assertions (`!`), no `Omit`.
- **Immutability** — create new objects/arrays, never mutate in place.
- **One export per file** — classes in `models/`, functions in `services/`, constants in `constants.ts`.
- **No comments** unless the _why_ is non-obvious (hidden constraints, workarounds).
- **No `console.log`** in committed code.
- Use `pnpm lint:fix` — never fix lint errors by hand.

## Community

Before contributing, please read our [Code of Conduct](CODE_OF_CONDUCT.md) and [Security Policy](SECURITY.md).

## License

By contributing, you agree that your contributions will be licensed under the [Apache 2.0 License](LICENSE).
