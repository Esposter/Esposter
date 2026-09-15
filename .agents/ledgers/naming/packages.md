# Packages

Every workspace package outside `apps/web` and `packages/shared`.

| Unit                                                                       | Swept      | Notes                                                                                                                                     |
| -------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/db-schema/src/schema`                                            | 2026-09-04 | column, table and enum member words are in scope — a rename is one forward migration; an enum column names its whole enum                 |
| `packages/db-schema/src/models`                                            | 2026-09-04 | a map keyed by an enum names that enum first, however long the pair reads                                                                 |
| `packages/db-schema/src` — `relations`, `services`, the root files         | 2026-09-04 | a relation file is drizzle's shape throughout; the pass reached two names                                                                 |
| `packages/db/src/services`                                                 | 2026-09-04 | a fixed lookup here is PascalCase like its siblings; a runtime cache says which of the two it is                                          |
| `packages/db/src/models`, the `packages/db` root files, `packages/db-mock` | 2026-09-04 | a model file with no type beside its values is named after the values                                                                     |
| `packages/azure`                                                           | 2026-09-04 | the wire conventions the real clients and the mocks share; an odata token is the protocol's spelling, not ours                            |
| `apps/functions/src` — `functions`, `handlers`                             | 2026-09-04 | an error-handler factory is named for what the handler it builds does, matching `logAndRethrow` beside it                                 |
| `apps/functions/src` — the rest                                            | 2026-09-04 | `hooks`, `models`, `services`, the root files; a binding takes the fetch's name minus its verb                                            |
| `packages/azure-mock`                                                      | 2026-09-04 | a sort comparator's pair is `first*`/`second*`; an operator's operands stay left- and right-hand side                                     |
| `packages/virrun/src/services/exec` — `snapshot`, `wsl`                    | 2026-09-04 | a predicate passed as a callback takes `check*` like any other; a memo keyed by one value is a `*Cache`, not a `<key><value>Map`          |
| `packages/virrun/src/services/exec` — the rest                             | 2026-09-04 | `bwrap`, `cache`, `differential`, `native`, `os`, `store`, `test`, `util`, `vfs`; a boolean value keeps `is*`, only a call takes `check*` |
| `packages/virrun/src/services` — the rest                                  | 2026-09-04 | `cli`, `configuration`, `source`, `vfs`, `virrun`; an in-file lookup table here is `SCREAMING_SNAKE` with the `_MAP` suffix               |
| `packages/virrun/src/models`, the `packages/virrun` root files             | 2026-09-04 | the constant casing says a value is fixed, not that a call site reads like one                                                            |
| `apps/infra/src/azure/resources`                                           | 2026-09-04 | a resource file's local `<kind>Name` is the same shape in all ninety, so it is the convention rather than the outlier                     |
| `apps/infra/src/azure` — `constants`, `services`, the root files           | 2026-09-04 | an azure notification key is the api's own shape, and `azure_native` is pulumi's namespace alias                                          |
| `apps/infra/src/github`, the `apps/infra` root files                       | 2026-09-04 | an infra constant's casing is its file's, so a scalar with no file of its own is the defect                                               |
| `packages/configuration`                                                   | 2026-09-04 | a named regex constant is `_REGEX` even where the regex is a selector string; `config` is spelled out                                     |
| `packages/parse-tmx`, `packages/vue-phaserjs`, `packages/xml2js`           | 2026-09-04 | a published barrel is in scope like any other export — no compatibility debt, migrations included                                         |
| `packages/keyframe-store`                                                  | —          | a content-addressed store's `read*` is the backend fetch, `get*` the hash and window derived from bytes in hand                           |
