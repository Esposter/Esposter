# Schemas

Zod and Drizzle together, because a table, its select schema and the input schema over it are one shape read in one pass: interface-first with `satisfies z.ZodType<T>`, `.shape` spread over `.extend()`, one interface and one schema per file, bare column builders, and every table and `pgEnum` registered.

| Unit                                                       | Swept      | Notes                                                                                                |
| ---------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| `packages/db-schema/src/schema.ts` + `relations`           | 2026-08-30 | the table/enum registration half is `schema.test.ts`'s rather than a pass's                          |
| `packages/db-schema/src/schema` — the message tables       | 2026-09-02 | the `*InMessage` family                                                                              |
| `packages/db-schema/src/schema` — the rest                 | 2026-08-30 | the twin `friends`/`friendRequests` blocks stay, and the `drizzle` skill says why                    |
| `app/shared/models/db/message`                             | 2026-08-31 | every input is composed by `.pick`/`.shape` spread, so a derived type alias is sanctioned            |
| `app/shared/models/db` — the room family                   | 2026-09-02 | `room`, `roomCategory`, `roomEmoji`, `role`, `moderation`, `webhook`                                 |
| `app/shared/models/db` — the rest                          | 2026-09-02 | `blueprint`, `friend`, `notification`, `post`, `searchHistory`, `user`, `userSettings`, `userToRoom` |
| `app/shared/models/resource/sheet`                         | 2026-09-02 | the split transformation's form defaults stay on the shared schema — `zod` says why                  |
| `app/shared/models/resource` — the rest                    | 2026-09-02 | the per-type content shapes and the capability types                                                 |
| `app/shared/models/dungeons`                               | 2026-09-02 |                                                                                                      |
| `app/shared/models` — the editor and game trees            | 2026-09-02 | the GrapesJS subclasses re-declare the catchall a `.shape` spread drops, pinned by a test            |
| `app/shared/models` — the rest                             | 2026-09-02 | `achievement`, `message`, `pagination`, `dataset`, `entity`, `compiler` and the singles              |
| `app/models`, `app/services/*/…` form schemas              | 2026-09-02 | the Vjsf-rendered ones carry extra rules                                                             |
| `packages/db`, `packages/db-mock`                          | 2026-09-02 | neither declares a table or a zod schema; the mock's snapshot is generated                           |
| `packages/shared`, `packages/parse-tmx`, `packages/xml2js` | 2026-09-02 | `parse-tmx` and `xml2js` depend on zod nowhere                                                       |

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
# `schema.extend(` and any chain whose `.extend(` starts on the next line. It is dominated by Tiptap's
# `Node.extend({})` — an unrelated API sharing the method name — so the hits are read, not counted
grep -rn '\.extend(' --include=*.ts packages/app/app packages/app/server packages/app/shared packages/*/src
# a discriminated union, each of which must carry a trailing satisfies
grep -rn -A 40 'z\.discriminatedUnion(' --include=*.ts packages/app/app packages/app/shared packages/*/src
```

## Next enforceable

- **The inherited-key rule is not lint-decidable, and a ban on the computed form was wrong.** `.safeExtend`
  Legitimately adds new fields as well as layering over existing ones, so nothing syntactic separates the key that
  Must match from the key that must not. It stays with the sweep; the `zod` skill carries the measured table of
  Which positions check a key and which do not.
- **Registration completeness belongs to `schema.test.ts`.** The relations half stays with the sweep:
  `relations.ts` spreads its parts rather than holding them, so there is no identity to compare and no crisp
  invariant — not every table earns a relation.
- **`.extend()` is not cleanly enforceable.** Tiptap's `.extend` and Zod's share one method name and no syntactic
  rule tells them apart — a receiver-name heuristic would ban the first by accident. It stays with the sweep, and
  the recipe above carries the anchor instead.
- A `z.discriminatedUnion` without a trailing `satisfies` is decidable from the AST, and the skill states the rule
  With no exceptions — which is exactly what a rule needs. Worth a plugin once a second violation appears; the
  Tree currently holds none.
- `export type X = z.infer<...>` is allowed in the narrow composed-schema case, so it needs the judgement the
  Sweep provides — leave it.
