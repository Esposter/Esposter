# Schemas

Zod and Drizzle together, because a table, its select schema and the input schema over it are one shape read in one pass: interface-first with `satisfies z.ZodType<T>`, `.shape` spread over `.extend()`, one interface and one schema per file, bare column builders, and every table and `pgEnum` registered.

| Unit                                                       | Swept      | Notes                                                                                                                                                  |
| ---------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/db-schema/src/schema.ts` + `relations`           | 2026-08-30 | complete both ways, and the table/enum half is now `schema.test.ts`'s rather than a sweep's                                                            |
| `packages/db-schema/src/schema` — the message tables       | —          | `*InMessage` is the largest family                                                                                                                     |
| `packages/db-schema/src/schema` — the rest                 | 2026-08-30 | `posts` sanitized its description twice, once per select schema; the twin `friends`/`friendRequests` blocks stay, and the `drizzle` skill now says why |
| `app/shared/models/db/message`                             | 2026-08-31 | clean — every input is composed by `.pick`/`.shape` spread, so the derived plain type alias is the sanctioned form                                     |
| `app/shared/models/db` — the room family                   | —          | `room`, `roomCategory`, `roomEmoji`, `role`, `moderation`, `webhook`                                                                                   |
| `app/shared/models/db` — the rest                          | —          |                                                                                                                                                        |
| `app/shared/models/resource/sheet`                         | —          | the column and transformation discriminated unions; `satisfies z.ZodType<ToData<T>>` on class-typed                                                    |
| `app/shared/models/resource` — the rest                    | —          | the per-type content shapes and the capability types over them                                                                                         |
| `app/shared/models/dungeons`                               | —          | persisted save shapes — latest-shape-only applies                                                                                                      |
| `app/shared/models` — the editor and game trees            | —          | `clicker`, `dashboard`, `flowchartEditor`, `emailEditor`, `webpageEditor`, `grapesjs`                                                                  |
| `app/shared/models` — the rest                             | —          | `achievement`, `message`, `pagination`, `dataset`, `entity`, `compiler`, and the singles                                                               |
| `app/models`, `app/services/*/…` form schemas              | —          | the Vjsf-rendered ones carry extra rules                                                                                                               |
| `packages/db`, `packages/db-mock`                          | —          | the mock's snapshot is generated; only its hand-written schema use is in scope                                                                         |
| `packages/shared`, `packages/parse-tmx`, `packages/xml2js` | —          | `@esposter/shared` takes `zod` as a peer and nothing else                                                                                              |

The three widest rows were split at their own subdirectories on 2026-08-31, before any pass read them: `db` was
102 files, `resource` 76 and the tail around 90, and a unit that size is grepped rather than read. The dates stay
absent — the parent rows never held one to carry down.

## Exclusions

- `snapshot.json` and generated `migration.sql` — machine state; a fixup is a `drizzle` task, not a sweep finding.
  An applied migration is history rather than a source of names: a schema rename is swept here and emits a new
  Forward migration, never an edit to the old file.
- Column casing — `drizzle`'s `pgTable` wrapper applies it, so there is nothing to carry. The **words** in a
  Column, table or enum member name are the `naming` ledger's.

## Find recipe

```bash
# schema-first derivation, which interface-first replaces
grep -rn 'z\.infer<typeof' --include=*.ts packages/app/app packages/app/server packages/app/shared packages/*/src
# .extend() where a .shape spread is the rule. Deliberately unanchored: a receiver pattern misses a stored
# `schema.extend(` and any chain whose `.extend(` starts on the next line. It is dominated by `dayjs.extend(plugin)`
# and Tiptap's `Node.extend({})` — unrelated APIs sharing the method name — so the hits are read, not counted
grep -rn '\.extend(' --include=*.ts packages/app/app packages/app/server packages/app/shared packages/*/src
# a discriminated union, each of which must carry a trailing satisfies
grep -rn -A 40 'z\.discriminatedUnion(' --include=*.ts packages/app/app packages/app/shared packages/*/src
```

## Next enforceable

- **Registration completeness is now enforced** — `schema.test.ts` imports every module in `src/schema` and
  Asserts each `pgTable`/`pgEnum` export is a value of the `schema` object, comparing by identity so a table
  Registered under the wrong key still counts (the naming test beside it owns the key). It was written on
  2026-08-30 and mutation-checked by dropping one entry, which it reports by file and export name. The relations
  Half stays with the sweep: `relations.ts` spreads its parts rather than holding them, so there is no identity
  To compare and no crisp invariant — not every table earns a relation.
- **`.extend()` is not cleanly enforceable, contrary to what this row first claimed.** `dayjs.extend`, Tiptap's
  `.extend` and Zod's share one method name and no syntactic rule tells them apart — a receiver-name heuristic
  Would ban the first two by accident. It stays with the sweep, and the recipe above carries the anchor instead.
- A `z.discriminatedUnion` without a trailing `satisfies` is decidable from the AST, and the skill states the rule
  With no exceptions — which is exactly what a rule needs. Worth a plugin once a second violation appears; the
  Tree currently holds none.
- `export type X = z.infer<...>` is allowed in the narrow composed-schema case, so it needs the judgement the
  Sweep provides — leave it.
