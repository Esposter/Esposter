# Schemas

Zod and Drizzle together, because a table, its select schema and the input schema over it are one shape read in one pass: interface-first with `satisfies z.ZodType<T>`, `.shape` spread over `.extend()`, one interface and one schema per file, bare column builders, and every table and `pgEnum` registered.

| Unit                                                       | Swept | Notes                                                                                                              |
| ---------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------ |
| `packages/db-schema/src/schema.ts` + `relations`           | —     | registration completeness — an unregistered export is invisible to `db:gen`                                        |
| `packages/db-schema/src/schema` — the message tables       | —     | `*InMessage` is the largest family                                                                                 |
| `packages/db-schema/src/schema` — the rest                 | —     | users, posts, resources, storage, auth                                                                             |
| `app/shared/models/db`                                     | —     | the input schemas every router imports                                                                             |
| `app/shared/models/resource`                               | —     | the discriminated unions; `satisfies z.ZodType<ToData<T>>` on class-typed                                          |
| `app/shared/models/dungeons`                               | —     | persisted save shapes — latest-shape-only applies                                                                  |
| `app/shared/models` — the rest                             | —     | `clicker`, `dashboard`, `flowchartEditor`, `achievement`, `message`, `pagination`, `dataset`, `entity`, `compiler` |
| `app/models`, `app/services/*/…` form schemas              | —     | the Vjsf-rendered ones carry extra rules                                                                           |
| `packages/db`, `packages/db-mock`                          | —     | the mock's snapshot is generated; only its hand-written schema use is in scope                                     |
| `packages/shared`, `packages/parse-tmx`, `packages/xml2js` | —     | `@esposter/shared` takes `zod` as a peer and nothing else                                                          |

## Exclusions

- `snapshot.json` and generated `migration.sql` — machine state; a fixup is a `drizzle` task, not a sweep finding.
- Migration SQL already applied — a rename costs a migration, so a naming finding here is raised rather than swept.
- Column naming — `drizzle`'s `pgTable` wrapper applies camelCase, so there is nothing to carry.

## Find recipe

```bash
# schema-first derivation, which interface-first replaces
grep -rn 'z\.infer<typeof' --include=*.ts packages/app/app packages/app/server packages/app/shared packages/*/src
# .extend() where a .shape spread is the rule. Anchored on a Zod receiver: a bare `.extend(` is dominated by
# `dayjs.extend(plugin)` and Tiptap's `Node.extend({})`, which are unrelated APIs sharing the method name
grep -rnE '(Schema|\)|\})\.extend\(' --include=*.ts packages/app/app packages/app/server packages/app/shared packages/*/src
# a discriminated union, each of which must carry a trailing satisfies
grep -rn -A 40 'z\.discriminatedUnion(' --include=*.ts packages/app/app packages/app/shared packages/*/src
```

## Next enforceable

- Registration completeness is a test, not a lint rule: walk the schema directory and assert every export appears
  In `schema.ts`.
- **`.extend()` is not cleanly enforceable, contrary to what this row first claimed.** `dayjs.extend`, Tiptap's
  `.extend` and Zod's share one method name and no syntactic rule tells them apart — a receiver-name heuristic
  Would ban the first two by accident. It stays with the sweep, and the recipe above carries the anchor instead.
- A `z.discriminatedUnion` without a trailing `satisfies` is decidable from the AST, and the skill states the rule
  With no exceptions — which is exactly what a rule needs. Worth a plugin once a second violation appears; the
  Tree currently holds none.
- `export type X = z.infer<...>` is allowed in the narrow composed-schema case, so it needs the judgement the
  Sweep provides — leave it.
