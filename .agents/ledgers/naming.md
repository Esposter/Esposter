# Naming

| Unit                                                                   | Swept      | Notes                                                                                                                                                                                                           |
| ---------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared`, `packages/shared-node`                              | —          | the published cross-package surface — a wrong name here is imported everywhere                                                                                                                                  |
| `app/shared/services`, `app/shared/util`                               | 2026-08-27 | `startsWithNumber` → `checkStartsWithNumber`; `itemConstants.ts` → `item/constants.ts`, the shape its own sibling already used. `check*` on the three invite/rbac predicates is the convention, not a violation |
| `app/shared/models`                                                    | —          | 319 files; splits again at its own subdirectories on contact                                                                                                                                                    |
| `server/trpc/routers`, `server/trpc/procedure`, `server/trpc/guards`   | —          | procedure and result naming; the `trpc` skill owns the pattern                                                                                                                                                  |
| `server/services`, `server/composables`, `server/api`, `server/routes` | —          | `get*` vs `read*` on the server side                                                                                                                                                                            |
| `app/store`                                                            | —          | CRUD verbs, `store*` subscription handlers; split at `message` if too large                                                                                                                                     |
| `app/composables`                                                      | —          | `use*` naming, the `{param}Value` `toValue` suffix                                                                                                                                                              |
| `app/services`, `app/util`, `app/models`, `app/types`                  | —          | filename-is-the-export                                                                                                                                                                                          |
| `app/components/Message`, `app/components/Resource`                    | —          | prop names, `is*`/`has*`/`show*`; two rows if one pass cannot read both                                                                                                                                         |
| `app/components` — the rest                                            | —          |                                                                                                                                                                                                                 |
| `packages/db`, `packages/db-schema`, `packages/db-mock`                | —          | column and table names are `drizzle`'s; identifiers around them are here                                                                                                                                        |
| `packages/azure`, `packages/azure-functions`, `packages/azure-mock`    | —          |                                                                                                                                                                                                                 |
| `packages/virrun`, `packages/infra`, `packages/configuration`          | —          |                                                                                                                                                                                                                 |
| `packages/parse-tmx`, `packages/vue-phaserjs`, `packages/xml2js`       | —          | published surfaces — a rename is a breaking change, so raise rather than do                                                                                                                                     |

## Exclusions

- Vue component **file** names — `vue-components` owns the tree's shape, and a component rename moves a file.
- Database columns and enum members — `drizzle` and `zod` own those, and a rename costs a migration.

## Open findings

- **`getIsAuthed` / `getIsRateLimited` / `getIsEntityIdEqualComparator` — `get*` is right, the `Is` is not.**
  All three return a function rather than a boolean, so `check*` would be wrong, but the `Is` still reads as a
  Predicate. The middleware pair wants a name saying what it builds; the comparator already has one.

## Next enforceable

- Filename-is-the-export is decidable from the AST plus the path; a custom oxlint plugin could take it whole.
- `is*`/`has*`/`show*` on a boolean-typed declaration needs types, which `typeAware: true` already provides.
- Abbreviation bans need a word list, not a rule — leave with the sweep.
- A `getIs*`/`getHas*` declaration is decidable from the name alone; the three `get*`-returning-a-function cases above are what a rule would have to carve out first.
