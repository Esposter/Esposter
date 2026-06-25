# @esposter/db-schema

[![Apache-2.0 licensed][badge-license]][url-license]

Drizzle ORM schemas, relations, and migrations for Esposter's PostgreSQL database. The source of truth for all relational data — usable in both browser and server environments.

## Table of Contents

- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/) to level up.

### Migration Workflow

After editing a schema file, generate and apply the migration:

```bash
# From packages/db-schema/
pnpm db:gen     # generate migration SQL from schema changes
pnpm db:up      # apply pending migrations to the database
pnpm db:studio  # open Drizzle Studio UI for visual inspection
```

Migrations are output to `packages/app/server/db/migrations/`.

### Schema Domains

| Domain       | Tables                                                         | Description                                      |
| ------------ | -------------------------------------------------------------- | ------------------------------------------------ |
| Users        | `users`, `sessions`, `accounts`                                | Authentication via better-auth                   |
| Rooms        | `rooms`, `roomMembers`, `roomRoles`, `roomInvites`, `roomBans` | Chat rooms + RBAC                                |
| Messages     | `messages` (schema: `message`)                                 | Message metadata; content in Azure Table Storage |
| Posts        | `posts`, `postReactions`                                       | Social feed posts                                |
| Achievements | `achievements`, `userAchievements`                             | Gamification                                     |
| Push         | `pushSubscriptions`                                            | Web Push notification subscriptions              |
| Friends      | `friendships`, `friendRequests`                                | Social graph                                     |

### Conventions

- Use the `pgTable` wrapper (re-exported from this package), **not** raw drizzle `pgTable` — the wrapper adds standard metadata columns.
- Columns use camelCase property names matching TypeScript properties.
- All `z.discriminatedUnion` schemas must end with `satisfies z.ZodType<UnionType>`.
- Each model file holds exactly one interface/class and one schema.

### Commands

Run from `packages/db-schema/`:

```bash
pnpm db:gen       # generate migration
pnpm db:up        # apply migrations
pnpm db:studio    # Drizzle Studio
pnpm build        # compile to dist/
pnpm test         # vitest watch mode
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
