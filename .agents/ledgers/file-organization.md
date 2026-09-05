# File organization

The question is where a thing lives and whether it exists twice — one export per file, no magic string where a constant already means it, no duplicate constant, the sole-consumer subfolder rule, alias imports.

| Unit                                                                       | Swept      | Notes                                                                    |
| -------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------ |
| `packages/shared`, `packages/shared-node`                                  | 2026-08-30 |                                                                          |
| `app/shared/services`, `app/shared/util`                                   | 2026-08-27 | `getSynchronizedFunction`'s second export is the exclusion below         |
| `app/shared/models/db`                                                     | —          |                                                                          |
| `app/shared/models/resource`                                               | —          |                                                                          |
| `app/shared/models/dungeons`                                               | —          |                                                                          |
| `app/shared/models` — `clicker`, `dashboard`, `dataset`, `flowchartEditor` | —          |                                                                          |
| `app/shared/models` — the rest                                             | —          | the small folders, several of them a single file                         |
| `app/services`, `app/util`, `app/models`, `app/types`                      | —          | models vs services vs utils vs constants; duplicate constants            |
| `app/composables`                                                          | —          | sole-consumer subfolders                                                 |
| `app/store`                                                                | —          |                                                                          |
| `server/services`, `server/composables`, `server/models`                   | —          |                                                                          |
| `server/trpc`                                                              | —          | input schemas belong in `shared/models`, not beside the router           |
| `app/components/Message`                                                   | —          | splits further at `Model/` on contact                                    |
| `app/components/Resource`                                                  | —          |                                                                          |
| `app/components` — the rest                                                | —          |                                                                          |
| `packages/db`, `packages/db-schema`, `packages/db-mock`                    | —          |                                                                          |
| `packages/azure`, `packages/azure-functions`, `packages/azure-mock`        | —          | cross-package placement: an Azure helper two packages need lives in `db` |
| `packages/virrun`, `packages/infra`, `packages/configuration`              | —          |                                                                          |
| `packages/parse-tmx`, `packages/vue-phaserjs`, `packages/xml2js`           | —          | barrel contents are `ctix` output — regenerate, never hand-edit          |
| `scripts`                                                                  | 2026-09-02 | a command is a folder once it has internals                              |

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
node -e '
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const list = (...globs) => execSync(`git ls-files ${globs.map((g) => `"${g}"`).join(" ")}`, { encoding: "utf8", maxBuffer: 1 << 28 }).split("
").filter(Boolean);
const sourceFiles = list("packages/shared/src/**/*.ts").filter((f) => !f.includes(".test.") && !f.endsWith("index.ts"));
const corpus = [...list("*.ts"), ...list("*.vue")].filter((f) => !f.includes("/dist/")).map((f) => [f, fs.readFileSync(f, "utf8")]);
for (const file of sourceFiles)
  for (const [, name] of fs.readFileSync(file, "utf8").matchAll(/^export (?:const|function|class|enum|type|interface) ([A-Za-z0-9_$]+)/gmu)) {
    const packages = [...new Set(corpus.filter(([f, body]) => f !== file && new RegExp(String.raw`${name}`, "u").test(body)).map(([f]) => f.split("/").slice(0, 2).join("/")))];
    if (packages.length < 2) console.log(`${packages.length}  ${file} -> ${name}`);
  }'
```

`String.raw` is load-bearing — a `\b` written into a template literal here becomes a backspace and the scan
reports every export as unused, which reads exactly like a tree of dead code (`sweeps` skill). The scan excludes
the export's own file, so a `0` names an export nothing outside that file references — dead code and an export
used only inside its own file produce the same result, and the pass tells them apart by opening the file.

## Exclusions

- Generated barrels (`index.ts` from `ctix`) and `snapshot.json` — machine state.
- Literals a postinstall-evaluated or JSON config must repeat, which the skill names as the one sanctioned duplication.
- `getSynchronizedFunction.ts` exporting `waitForSynchronizedFunctions` beside it: the pair shares the pending
  set through closure, so one-export-per-file cannot reach them without making that state a module global.

## Next enforceable

- One export per file is syntactic; a custom oxlint plugin decides it outright.
- A `util/` file importing a third-party package belongs in `services/`, and that is a specifier test: a
  `no-restricted-imports` override on `**/util/**` whose `group` is `["*", "!node:*", "!#src/*", "!@esposter/*"]` decides
  it, if oxlint honours a negated group and an `allowTypeImports` escape for the pure type utilities under
  `util/types`. Both are unverified — the pass that builds it proves the rule can fail first (`sweeps` skill).
- Alias imports are already enforced by the `@/**`-under-`packages/*/src/**` ban.
- Duplicate constants and the sole-consumer rule need the whole repo in mind; they stay with the sweep.
