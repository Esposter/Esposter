# Naming

| Unit                                                                                                                                        | Swept      | Notes                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| `packages/shared`, `packages/shared-node`                                                                                                   | 2026-08-30 |                                                                                                 |
| `app/shared/services`, `app/shared/util`                                                                                                    | 2026-08-27 |                                                                                                 |
| `app/shared/models/db/message`                                                                                                              | 2026-09-02 | the input schemas every message router imports                                                  |
| `app/shared/models/db` — `room`, `role`, `moderation`, `webhook`, …                                                                         | 2026-09-02 | a field mirroring its own column is `packages/db-schema`'s row, not this one                    |
| `app/shared/models/db` — the rest                                                                                                           | 2026-09-02 |                                                                                                 |
| `app/shared/models/resource/sheet`                                                                                                          | 2026-09-02 |                                                                                                 |
| `app/shared/models/resource` — the rest                                                                                                     | 2026-09-02 | a type naming what a procedure answers with ends in `Result`                                    |
| `app/shared/models/dungeons`                                                                                                                | 2026-09-02 | the grid-engine `Direction` casing is theirs                                                    |
| `app/shared/models` — the editor and game trees                                                                                             | 2026-09-02 | these mirror `@vue-flow/core` and ApexCharts field for field, so their spellings are not ours   |
| `app/shared/models` — the rest                                                                                                              | 2026-09-03 | `achievement`, `message`, `pagination`, `dataset`, `entity`, `compiler`, `trpc`, `room`, `auth` |
| `server/trpc/routers` — `message`, `room`, `userToRoom`, `role`, `call`, `webhook`, `searchHistory`                                         | 2026-09-03 | procedure and result naming; the `trpc` skill owns the pattern                                  |
| `server/trpc/routers` — `resource`, `blueprint`, `note`, `program`, `sheet`, `todoList`, `survey`                                           | 2026-09-03 | an error constructor is `get*Error`, matching the guards                                        |
| `server/trpc/routers` — `dashboard`, `dataset`, `email`, `flowchart`, `webpage`, `post`, `like`, `block`, `friend`, `friendRequest`, `user` | —          |                                                                                                 |
| `server/trpc/routers` — `achievement`, `app`, `clicker`, `dungeons`, `notification`, `pushSubscription`, `session`, `storage`               | —          |                                                                                                 |
| `server/trpc/{guards,procedure,plugins,middleware}`, `context.ts`                                                                           | —          |                                                                                                 |
| `server/services`, `server/composables`, `server/api`, `server/routes`                                                                      | —          | `get*` vs `read*` on the server side                                                            |
| `app/store`                                                                                                                                 | —          | CRUD verbs, `store*` subscription handlers; split at `message` if too large                     |
| `app/composables`                                                                                                                           | —          | `use*` naming, the `{param}Value` `toValue` suffix                                              |
| `app/services`, `app/util`, `app/models`, `app/types`                                                                                       | —          | filename-is-the-export                                                                          |
| `app/components/Message`, `app/components/Resource`                                                                                         | —          | two rows if one pass cannot read both                                                           |
| `app/components` — the rest                                                                                                                 | —          |                                                                                                 |
| `packages/db`, `packages/db-schema`, `packages/db-mock`                                                                                     | —          | column, table and enum member words are in scope — a rename is one forward migration            |
| `packages/azure`, `packages/azure-functions`, `packages/azure-mock`                                                                         | —          |                                                                                                 |
| `packages/virrun`, `packages/infra`, `packages/configuration`                                                                               | —          |                                                                                                 |
| `packages/parse-tmx`, `packages/vue-phaserjs`, `packages/xml2js`                                                                            | —          | published surfaces — a rename is a breaking change, so raise rather than do                     |

A component file name is in scope for its **words** — the rule spelling `Navigation` over `Nav` reads a filename
the same way it reads any other identifier. The prefix-and-fold question over that same tree stays
`vue-components`'s: one tree, two questions, which is what keeps both ledgers whole. Nothing is excluded here on
the grounds that a rename is expensive — that is the argument
[no compatibility debt](/docs/architecture/no-compatibility-debt) already refuses, migrations included.

## Open findings

- **`readMembersByIds` and `readMessagesByRowKeys` keep a suffix the cardinality rule bans.** Every other
  `*ByIds` read dropped it, but these two share a feature with a paginated read of the same rows
  (`readMembers`, `readMessages`), so the suffix is what separates two procedures rather than marking a batch
  upgrade — and dropping it collides. What the pair should be called instead is the open question.
- **`getIsAuthed` / `getIsRateLimited` / `getIsEntityIdEqualComparator` — `get*` is right, the `Is` is not.**
  All three return a function rather than a boolean, so `check*` would be wrong, but the `Is` still reads as a
  Predicate. The middleware pair wants a name saying what it builds; the comparator already has one.

## Next enforceable

- Filename-is-the-export is decidable from the AST plus the path; a custom oxlint plugin could take it whole.
- `is*`/`has*`/`show*` on a boolean-typed declaration needs types, which `typeAware: true` already provides.
- Abbreviation bans need a word list, not a rule — leave with the sweep.
- A `getIs*`/`getHas*` declaration is decidable from the name alone; the three `get*`-returning-a-function cases above are what a rule would have to carve out first.
