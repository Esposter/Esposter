# File organization

The question is where a thing lives and whether it exists twice — one export per file, no magic string where a constant already means it, no duplicate constant, the sole-consumer subfolder rule, alias imports, and an interface or type in its own model file rather than beside the code that reads it.

| Unit                                                                       | Swept      | Notes                                                                                        |
| -------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------- |
| `packages/shared`, `packages/shared-node`                                  | 2026-09-12 |                                                                                              |
| `app/shared/services`, `app/shared/util`                                   | 2026-09-12 | `getSynchronizedFunction`'s second export is the exclusion below                             |
| `app/shared/models/db`                                                     | 2026-09-12 |                                                                                              |
| `app/shared/models/resource`                                               | —          |                                                                                              |
| `app/shared/models/dungeons`                                               | —          |                                                                                              |
| `app/shared/models` — `clicker`, `dashboard`, `dataset`, `flowchartEditor` | —          |                                                                                              |
| `app/shared/models` — the rest                                             | —          | the small folders, several of them a single file                                             |
| `app/services`                                                             | 2026-09-12 | a file is named for its export, and a second map is a second file                            |
| `app/models/dungeons`                                                      | 2026-09-12 | a class hierarchy stays a model; a map and the behaviour it dispatches to do not             |
| `app/models/resource`                                                      | 2026-09-12 | a command class stays a model; the map beside a form union does not                          |
| `app/models/message`                                                       | —          | a type derived from a services map is a type-only import, not a move                         |
| `app/models` — the rest                                                    | —          | the resolver class hierarchies stay models, like the sheet commands                          |
| `app/util`                                                                 | 2026-09-12 | a type-only third-party import is the `util/types` escape, not a `services/` move            |
| `app/types`                                                                | 2026-09-12 | ambient `.d.ts` only                                                                         |
| `app/composables`                                                          | 2026-09-12 | sole-consumer subfolders                                                                     |
| `app/store`                                                                | 2026-09-12 | a store's file is named for its domain, so the filename never matches its `use*Store` export |
| `server/services`, `server/composables`, `server/models`                   | 2026-09-12 |                                                                                              |
| `server/trpc` — the resource family                                        | 2026-09-12 | `resource`, `survey`, `program`, `procedure/resource`                                        |
| `server/trpc` — the room family                                            | 2026-09-12 | `room`, `call`, `userToRoom`                                                                 |
| `server/trpc` — the rest                                                   | 2026-09-12 | the loose routers, `guards`, `procedure`, `plugins`, `middleware`                            |
| `app/components/Message`                                                   | —          | the stray-component half is `components/index.test.ts`, not a pass                           |
| `app/components/Resource`                                                  | —          |                                                                                              |
| `app/components` — the rest                                                | —          | a `*Props.ts` beside its component is colocation, not a stray model                          |
| `packages/db-schema` — `models`                                            | —          |                                                                                              |
| `packages/db-schema` — `schema`, `relations`                               | —          | a table file declares the table and its select schema; enums live in `models`                |
| `packages/db-schema` — `services`, root                                    | 2026-09-12 |                                                                                              |
| `packages/db` — `services/azure`                                           | 2026-09-12 |                                                                                              |
| `packages/db` — the rest, `packages/db-mock`                               | 2026-09-12 |                                                                                              |
| `packages/azure`, `apps/functions`, `packages/azure-mock`                  | 2026-09-12 | cross-package placement: an Azure helper two packages need lives in `db`                     |
| `packages/virrun` — `services/exec/wsl`                                    | —          |                                                                                              |
| `packages/virrun` — `services/exec/snapshot`                               | —          |                                                                                              |
| `packages/virrun` — `services/exec/util`                                   | —          |                                                                                              |
| `packages/virrun` — `services/exec` — the rest                             | —          | `cache`, `os`, `bwrap`, `vfs`, `differential`, `store`, `native`, `test`                     |
| `packages/virrun` — `services` — the rest                                  | —          | `cli`, `configuration`, `source`, `vfs`, `virrun`                                            |
| `packages/virrun` — `models`, root                                         | —          |                                                                                              |
| `apps/infra` — `azure/resources`                                           | —          | one resource per file, named for its export                                                  |
| `apps/infra` — `azure` — the rest                                          | —          | `constants`, `services`, the stack files                                                     |
| `apps/infra` — `github`, root                                              | —          |                                                                                              |
| `packages/configuration`                                                   | 2026-09-12 |                                                                                              |
| `packages/parse-tmx`, `packages/vue-phaserjs`, `packages/xml2js`           | —          | barrel contents are `ctix` output — regenerate, never hand-edit                              |
| `scripts`                                                                  | 2026-09-12 | a command is a folder once it has internals                                                  |

## Find recipe

A duplicate constant is the one thing no skill states a grep for, because it is found by value rather than by name:

```bash
# String literals appearing in more than one file — the candidate list, not the finding
grep -rhoE '"[a-zA-Z][a-zA-Z0-9 ./_-]{4,}"' --include=*.ts --include=*.vue apps/web/app apps/web/server apps/web/shared packages/*/src |
  sort | uniq -c | sort -rn | awk '$1 > 1'
```

## The consumer scan

The ≥2-consumers rule is answered by counting the **packages** that name each export, which needs the whole repo
in memory rather than a grep per name:

```bash
pnpm ai:sweep:shared-export-consumers
```

It excludes the export's own **package**, not merely its own file: `packages/shared` naming its own export is the
library using itself, and counting that would let one real consumer clear a threshold that asks for two. So a
`0` names an export nothing outside `packages/shared` references — dead code and a helper the package uses
internally produce the same result, and the pass tells them apart by opening the file. A `1` is the rule's own
finding: one consumer does not earn a place in a shared package.

## Exclusions

- Generated barrels (`index.ts` from `ctix`) and `snapshot.json` — machine state.
- Literals a postinstall-evaluated or JSON config must repeat, which the skill names as the one sanctioned duplication.
- Two exports sharing module-private state through closure — a pending set, a cached promise, a code set, a
  dispatch map. One-export-per-file cannot reach them without making that state a module global, which trades a
  file boundary for a wider one.

## Next enforceable

- One export per file and the models rule both fail the `oxlint` skill's roster gate — each one's exceptions are a
  list of filenames and shapes (`constants.ts`, a schema beside its type, an enum beside its values array, a
  composable's own options) that grows with the repo — so both stay with the sweep; the `oxlint` skill's Settled
  list carries the models-rule plugin.
- A `util/` file importing a third-party package belongs in `services/`, and that is a specifier test: a
  `no-restricted-imports` override on `**/util/**` whose `group` is `["*", "!node:*", "!#src/*", "!@esposter/*"]` decides
  it, if oxlint honours a negated group and an `allowTypeImports` escape for the pure type utilities under
  `util/types`. Both are unverified — the pass that builds it proves the rule can fail first (`sweeps` skill).
- Alias imports are already enforced by the `@/**`-under-`packages/*/src/**` ban.
- Duplicate constants and the sole-consumer rule need the whole repo in mind; they stay with the sweep.
