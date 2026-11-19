# Schemas

Zod and Drizzle together, because a table, its select schema and the input schema over it are one shape read in one pass: interface-first with `satisfies z.ZodType<T>`, `.shape` spread over `.extend()`, one interface and one schema per file, bare column builders, and every table and `pgEnum` registered.

| Unit                                                       | Swept                   | Notes                                                                                                |
| ---------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `packages/db-schema/src/generated/schema.ts` + `relations` | —                       | a `r.many` key is the child table's own name; an `r.one` off a role column is the role               |
| `packages/db-schema/src/schema` — the message tables       | —                       | the `*InMessage` family                                                                              |
| `packages/db-schema/src/schema` — the rest                 | —                       | the twin `friends`/`friendRequests` blocks stay, and the `drizzle` skill says why                    |
| `shared/models/db/message`                                 | —                       | every input is composed by `.pick`/`.shape` spread, so a derived type alias is sanctioned            |
| `shared/models/db` — the room family                       | —                       | `room`, `roomCategory`, `roomEmoji`, `role`, `moderation`, `webhook`                                 |
| `shared/models/db` — the rest                              | —                       | `blueprint`, `friend`, `notification`, `post`, `searchHistory`, `user`, `userSettings`, `userToRoom` |
| `shared/models/resource/sheet`                             | —                       | the split transformation's form defaults stay on the shared schema — `zod` says why                  |
| `shared/models/resource` — the rest                        | —                       | the per-type content shapes and the capability types                                                 |
| `shared/models/dungeons`                                   | —                       |                                                                                                      |
| `shared/models` — the page builder and game trees          | 2026-10-29 · Sonnet 5.5 |                                                                                                      |
| `shared/models` — the rest                                 | —                       | `achievement`, `message`, `pagination`, `dataset`, `entity`, `compiler` and the singles              |
| `app/models`, `app/services/*` form schemas                | —                       | the schema-form ones carry extra rules                                                               |
| `packages/db`, `packages/db-mock`                          | —                       | neither declares a table or a zod schema; the mock's snapshot is generated                           |
| `packages/shared`, `packages/parse-tmx`                    | —                       | `parse-tmx` depends on zod nowhere                                                                   |

## Exclusions

- `snapshot.json` and generated `migration.sql` — machine state; a fixup is a `drizzle` task, not a sweep finding.
  An applied migration is history rather than a source of names: a schema rename is swept here and emits a new
  forward migration, never an edit to the old file.
- Column casing — `drizzle`'s `pgTable` wrapper applies it, so there is nothing to carry. The **words** in a
  column, table or value-set member name are the `naming` ledger's.

## Find recipe

```bash
# schema-first derivation, which interface-first replaces
grep -rn 'z\.infer<typeof' --include=*.ts apps/web/app apps/web/server apps/web/shared packages/*/src
# .extend() where a .shape spread is the rule. Deliberately unanchored: a receiver pattern misses a stored
# `schema.extend(` and any chain whose `.extend(` starts on the next line. It is dominated by Tiptap's
# `Node.extend({})` — an unrelated API sharing the method name — so the hits are read, not counted
grep -rn '\.extend(' --include=*.ts apps/web/app apps/web/server apps/web/shared packages/*/src
# a discriminated union, each of which must carry a trailing satisfies
grep -rn -A 40 'z\.discriminatedUnion(' --include=*.ts apps/web/app apps/web/shared packages/*/src
```
