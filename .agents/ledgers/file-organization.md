# File organization

The question is where a thing lives and whether it exists twice — one export per file, no magic string where a constant already means it, no duplicate constant, the sole-consumer subfolder rule, alias imports.

| Unit                                                                       | Swept      | Notes                                                                                        |
| -------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------- |
| `packages/shared`, `packages/shared-node`                                  | 2026-08-30 |                                                                                              |
| `app/shared/services`, `app/shared/util`                                   | 2026-08-27 | `getSynchronizedFunction`'s second export is the exclusion below                             |
| `app/shared/models/db`                                                     | 2026-09-06 |                                                                                              |
| `app/shared/models/resource`                                               | 2026-09-06 |                                                                                              |
| `app/shared/models/dungeons`                                               | 2026-09-06 |                                                                                              |
| `app/shared/models` — `clicker`, `dashboard`, `dataset`, `flowchartEditor` | 2026-09-06 |                                                                                              |
| `app/shared/models` — the rest                                             | 2026-09-06 | the small folders, several of them a single file                                             |
| `app/services`                                                             | 2026-09-06 | a file is named for its export, and a second map is a second file                            |
| `app/models/dungeons`                                                      | 2026-09-06 | a class hierarchy stays a model; a map and the behaviour it dispatches to do not             |
| `app/models/resource`                                                      | 2026-09-06 | a command class stays a model; the map beside a form union does not                          |
| `app/models/message`                                                       | 2026-09-06 | a type derived from a services map is a type-only import, not a move                         |
| `app/models` — the rest                                                    | 2026-09-06 | the resolver class hierarchies stay models, like the sheet commands                          |
| `app/util`                                                                 | 2026-09-06 | a type-only third-party import is the `util/types` escape, not a `services/` move            |
| `app/types`                                                                | 2026-09-06 | ambient `.d.ts` only                                                                         |
| `app/composables`                                                          | 2026-09-06 | sole-consumer subfolders                                                                     |
| `app/store`                                                                | 2026-09-06 | a store's file is named for its domain, so the filename never matches its `use*Store` export |
| `server/services`, `server/composables`, `server/models`                   | 2026-09-06 |                                                                                              |
| `server/trpc` — the resource family                                        | 2026-09-06 | `resource`, `survey`, `program`, `procedure/resource`                                        |
| `server/trpc` — the room family                                            | 2026-09-06 | `room`, `call`, `userToRoom`                                                                 |
| `server/trpc` — the rest                                                   | 2026-09-06 | the loose routers, `guards`, `procedure`, `plugins`, `middleware`                            |
| `app/components/Message`                                                   | 2026-09-06 | the stray-component half is `components/index.test.ts`, not a pass                           |
| `app/components/Resource`                                                  | 2026-09-06 |                                                                                              |
| `app/components` — the rest                                                | 2026-09-06 | a `*Props.ts` beside its component is colocation, not a stray model                          |
| `packages/db-schema` — `models`                                            | 2026-09-06 |                                                                                              |
| `packages/db-schema` — `schema`, `relations`                               | 2026-09-06 | a table file declares the table and its select schema; enums live in `models`                |
| `packages/db-schema` — `services`, root                                    | 2026-09-06 |                                                                                              |
| `packages/db` — `services/azure`                                           | 2026-09-06 |                                                                                              |
| `packages/db` — the rest, `packages/db-mock`                               | 2026-09-06 |                                                                                              |
| `packages/azure`, `packages/azure-functions`, `packages/azure-mock`        | 2026-09-06 | cross-package placement: an Azure helper two packages need lives in `db`                     |
| `packages/virrun` — `services/exec/wsl`                                    | 2026-09-06 |                                                                                              |
| `packages/virrun` — `services/exec/snapshot`                               | 2026-09-06 |                                                                                              |
| `packages/virrun` — `services/exec/util`                                   | 2026-09-06 |                                                                                              |
| `packages/virrun` — `services/exec` — the rest                             | 2026-09-06 | `cache`, `os`, `bwrap`, `vfs`, `differential`, `store`, `native`, `test`                     |
| `packages/virrun` — `services` — the rest                                  | 2026-09-06 | `cli`, `configuration`, `source`, `vfs`, `virrun`                                            |
| `packages/virrun` — `models`, root                                         | 2026-09-06 |                                                                                              |
| `packages/infra` — `azure/resources`                                       | 2026-09-06 | one resource per file, named for its export                                                  |
| `packages/infra` — `azure` — the rest                                      | 2026-09-06 | `constants`, `services`, the stack files                                                     |
| `packages/infra` — `github`, root                                          | 2026-09-06 |                                                                                              |
| `packages/configuration`                                                   | 2026-09-06 |                                                                                              |
| `packages/parse-tmx`, `packages/vue-phaserjs`, `packages/xml2js`           | 2026-09-06 | barrel contents are `ctix` output — regenerate, never hand-edit                              |
| `scripts`                                                                  | 2026-09-02 | a command is a folder once it has internals                                                  |

## Find recipe

A duplicate constant is the one thing no skill states a grep for, because it is found by value rather than by name:

```bash
# String literals appearing in more than one file — the candidate list, not the finding
grep -rhoE '"[a-zA-Z][a-zA-Z0-9 ./_-]{4,}"' --include=*.ts --include=*.vue packages/app/app packages/app/server packages/app/shared packages/*/src |
  sort | uniq -c | sort -rn | awk '$1 > 1'
```

## The consumer scan

The ≥2-consumers rule is answered by counting the **packages** that name each export, which needs the whole repo
in memory rather than a grep per name:

```bash
pnpm sweep:shared-export-consumers
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

- One export per file is syntactic; a custom oxlint plugin decides it outright.
- A `util/` file importing a third-party package belongs in `services/`, and that is a specifier test: a
  `no-restricted-imports` override on `**/util/**` whose `group` is `["*", "!node:*", "!#src/*", "!@esposter/*"]` decides
  it, if oxlint honours a negated group and an `allowTypeImports` escape for the pure type utilities under
  `util/types`. Both are unverified — the pass that builds it proves the rule can fail first (`sweeps` skill).
- Alias imports are already enforced by the `@/**`-under-`packages/*/src/**` ban.
- Duplicate constants and the sole-consumer rule need the whole repo in mind; they stay with the sweep.
