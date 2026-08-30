# File organization

The question is where a thing lives and whether it exists twice — one export per file, no magic string where a constant already means it, no duplicate constant, the sole-consumer subfolder rule, alias imports.

| Unit                                                                | Swept      | Notes                                                                                                                                                                                |
| ------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/shared`, `packages/shared-node`                           | 2026-08-30 | every export has a caller; the two with none are the same file's own annotations, raised below rather than done                                                                      |
| `app/shared/services`, `app/shared/util`                            | 2026-08-27 | `AchievementDefinitionMap` moved out of `achievementDefinitions.ts` into its own file, with its colocated suite; `getSynchronizedFunction`'s second export is exempt and now says so |
| `app/shared/models`                                                 | —          | 319 files; splits again at its own subdirectories on contact                                                                                                                         |
| `app/services`, `app/util`, `app/models`, `app/types`               | —          | models vs services vs utils vs constants; duplicate constants                                                                                                                        |
| `app/composables`                                                   | —          | sole-consumer subfolders                                                                                                                                                             |
| `app/store`                                                         | —          |                                                                                                                                                                                      |
| `server/services`, `server/composables`, `server/models`            | —          |                                                                                                                                                                                      |
| `server/trpc`                                                       | —          | input schemas belong in `shared/models`, not beside the router                                                                                                                       |
| `app/components/Message`                                            | —          | splits further at `Model/` on contact                                                                                                                                                |
| `app/components/Resource`                                           | —          |                                                                                                                                                                                      |
| `app/components` — the rest                                         | —          |                                                                                                                                                                                      |
| `packages/db`, `packages/db-schema`, `packages/db-mock`             | —          |                                                                                                                                                                                      |
| `packages/azure`, `packages/azure-functions`, `packages/azure-mock` | —          | cross-package placement: an Azure helper two packages need lives in `db`                                                                                                             |
| `packages/virrun`, `packages/infra`, `packages/configuration`       | —          |                                                                                                                                                                                      |
| `packages/parse-tmx`, `packages/vue-phaserjs`, `packages/xml2js`    | —          | barrel contents are `ctix` output — regenerate, never hand-edit                                                                                                                      |

## Find recipe

A duplicate constant is the one thing no skill states a grep for, because it is found by value rather than by name:

```bash
# String literals appearing in more than one file — the candidate list, not the finding
grep -rhoE '"[a-zA-Z][a-zA-Z0-9 ./_-]{4,}"' --include=*.ts --include=*.vue packages/app/app packages/app/server packages/app/shared packages/*/src |
  sort | uniq -c | sort -rn | awk '$1 > 1'
```

## Open findings

- **`createUniqueArraySchema.ts` exports two types nothing outside it names.** `CreateUniqueArraySchema`
  Annotates the const beside it and `UniqueArraySchemaKey` is used only by that annotation, so both are the
  File's own scaffolding rather than a surface — the no-unused-exports rule says they lose the `export`, and
  Building with it removed passes `attw` and `publint`. Left alone because `@esposter/shared` is published, and
  Narrowing a published `.d.ts` is a breaking change to raise rather than fold into a sweep.

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

`String.raw` is load-bearing — a `` written into a template literal here becomes a backspace and the scan
reports every export as unused, which reads exactly like a tree of dead code (`sweeps` skill). Two counts are
worth running: excluding the package's own source answers "does this belong here", and including it answers "is
this referenced at all" — the second is what separates a dead export from one its own file annotates.

## Exclusions

- Generated barrels (`index.ts` from `ctix`) and `snapshot.json` — machine state.
- Literals a postinstall-evaluated or JSON config must repeat, which the skill names as the one sanctioned duplication.
- `getSynchronizedFunction.ts` exporting `waitForSynchronizedFunctions` beside it: the pair shares the pending
  Set through closure, so one-export-per-file cannot reach them without making that state a module global.

## Next enforceable

- One export per file is syntactic; a custom oxlint plugin decides it outright.
- Alias imports are already enforced — the `@/**`-under-`packages/*/src/**` ban retired the `package-imports` sweep.
- Duplicate constants and the sole-consumer rule need the whole repo in mind; they stay with the sweep.
