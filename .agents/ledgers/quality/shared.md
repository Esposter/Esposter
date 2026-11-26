# Shared

| Unit                                                          | Notes                                                                                  |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `apps/web/shared/services` — the rest                         | `app`, `intl`, `notification`, `room`, `storage`, `superjson`, `survey`, `trpc`, `zod` |
| `apps/web/shared/services/dungeons`, `apps/web/shared/assets` | the definition data both halves read; `shared/generated` is generator output           |
| `apps/web/shared/services/resource` — the rest                | nothing to collapse — `ResourceDefinitionMap.title` restating the type is load-bearing |
| `packages/shared` — `src/util/types`                          | the near-duplicate `DeepOmit` type tests are the `testing` ledger's                    |

Notes on a tree several units share:

- `apps/web/shared/models/db` — the rest: `user`, `userSettings`, `session`, `webhook`, `searchHistory`, `friend`, `notification`, `achievement`
- `apps/web/shared/models` — the rest: `auth`, `entity`, `environment`, `file`, `notification`, `room`, `trpc`
