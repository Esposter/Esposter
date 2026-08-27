# File organization

The question is where a thing lives and whether it exists twice — one export per file, no magic string where a constant already means it, no duplicate constant, the sole-consumer subfolder rule, alias imports.

| Unit                                                                | Swept | Notes                                                                      |
| ------------------------------------------------------------------- | ----- | -------------------------------------------------------------------------- |
| `packages/shared`, `packages/shared-node`                           | —     | the ≥2-consumers rule bites hardest here: name the second consumer or move |
| `app/shared/services`, `app/shared/util`                            | —     |                                                                            |
| `app/shared/models`                                                 | —     | 319 files; splits again at its own subdirectories on contact               |
| `app/services`, `app/util`, `app/models`, `app/types`               | —     | models vs services vs utils vs constants; duplicate constants              |
| `app/composables`                                                   | —     | sole-consumer subfolders                                                   |
| `app/store`                                                         | —     |                                                                            |
| `server/services`, `server/composables`, `server/models`            | —     |                                                                            |
| `server/trpc`                                                       | —     | input schemas belong in `shared/models`, not beside the router             |
| `app/components/Message`                                            | —     | splits further at `Model/` on contact                                      |
| `app/components/Resource`                                           | —     |                                                                            |
| `app/components` — the rest                                         | —     |                                                                            |
| `packages/db`, `packages/db-schema`, `packages/db-mock`             | —     |                                                                            |
| `packages/azure`, `packages/azure-functions`, `packages/azure-mock` | —     | cross-package placement: an Azure helper two packages need lives in `db`   |
| `packages/virrun`, `packages/infra`, `packages/configuration`       | —     |                                                                            |
| `packages/parse-tmx`, `packages/vue-phaserjs`, `packages/xml2js`    | —     | barrel contents are `ctix` output — regenerate, never hand-edit            |

## Find recipe

A duplicate constant is the one thing no skill states a grep for, because it is found by value rather than by name:

```bash
# String literals appearing in more than one file — the candidate list, not the finding
grep -rhoE '"[a-zA-Z][a-zA-Z0-9 ./_-]{4,}"' --include=*.ts --include=*.vue packages/app/app packages/app/server packages/app/shared packages/*/src |
  sort | uniq -c | sort -rn | awk '$1 > 1'
```

## Open findings

- **`shared/services/achievement/achievementDefinitions.ts` holds two exports and names one.**
  `AchievementDefinitionMap` is the PascalCase constant map the `naming` skill says belongs in
  `AchievementDefinitionMap.ts` — it names this exact shape a legacy outlier not to copy. Splitting it moves 29
  Importers, which is its own commit rather than a tail-end edit. The `app/shared/services` row stays `—` until
  It lands.

## Exclusions

- Generated barrels (`index.ts` from `ctix`) and `snapshot.json` — machine state.
- Literals a postinstall-evaluated or JSON config must repeat, which the skill names as the one sanctioned duplication.
- `getSynchronizedFunction.ts` exporting `waitForSynchronizedFunctions` beside it: the pair shares the pending
  Set through closure, so one-export-per-file cannot reach them without making that state a module global.

## Next enforceable

- One export per file is syntactic; a custom oxlint plugin decides it outright.
- Alias imports are already enforced — the `@/**`-under-`packages/*/src/**` ban retired the `package-imports` sweep.
- Duplicate constants and the sole-consumer rule need the whole repo in mind; they stay with the sweep.
