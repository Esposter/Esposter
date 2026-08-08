# @esposter/db-schema

[![Apache-2.0 licensed][badge-license]][url-license]

Drizzle ORM schemas, relations, and migrations for Esposter's PostgreSQL database. The source of truth for all relational data — usable in both browser and server environments.

## Table of Contents

- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/api/modules/_esposter_db-schema.html) to level up.

### Migration Workflow

After editing a schema file, generate the migration:

```bash
# From packages/db-schema/
pnpm db:gen     # generate migration SQL from schema changes
pnpm db:up      # upgrade snapshot metadata to a newer drizzle-kit format
pnpm db:studio  # open Drizzle Studio UI for visual inspection
```

Migrations are output to `packages/app/server/db/migrations/` and are applied automatically at app startup by the Nitro plugin `packages/app/server/plugins/migrate.ts` — there is no apply script.

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
pnpm db:up        # upgrade snapshot metadata
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
