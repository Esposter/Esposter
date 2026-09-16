# Tooling

The repo's own scripts and the agent tree — code no product area claims, and the gap the eight product areas
left when this ledger was written.

| Unit                                                           | Swept      | Notes                                                                                         |
| -------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| `scripts/src/services/coderabbit/collect`                      | —          | the collector's decision surface                                                              |
| `scripts/src/services/coderabbit` — `feedback`, `shared`       | —          |                                                                                               |
| `scripts/src/services/sweeps` — the scans                      | —          | everything but `ledgerCoverage` and `skillDocs`                                               |
| `scripts/src/services/sweeps` — `ledgerCoverage`, `skillDocs`  | —          | the two that read the ledgers and the skill tree                                              |
| `scripts/src/services/outdatedDependencies`                    | —          |                                                                                               |
| `scripts/src/services/oxlint`                                  | —          |                                                                                               |
| `scripts/src/services/citations`                               | —          |                                                                                               |
| `scripts/src/services/shared`, `dependencyGraph`, `updateNode` | —          |                                                                                               |
| `scripts/src/models`                                           | —          | one type per file, no logic                                                                   |
| `scripts/src/workspace`                                        | —          | the enforcers, not the tooling they hold                                                      |
| `scripts/src` — the entrypoints                                | —          | `citations`, `coderabbit`, `crossOS`, `dependencyGraph`, `refreshLockfile`, `sweeps`          |
| `scripts/src/outdatedDependencies`                             | 2026-09-15 |                                                                                               |
| `scripts/src/oxlint`                                           | 2026-09-15 |                                                                                               |
| `scripts/src/updateNode`                                       | 2026-09-15 |                                                                                               |
| the repository root — config and Markdown                      | 2026-09-06 | the composite actions already carry what the workflows share                                  |
| `apps/web/configuration`                                       | 2026-09-15 | the relative imports are the pre-alias config exception; the splash table is generator output |
| the app's root config files                                    | 2026-09-15 |                                                                                               |
| `content/docs` — the two suites                                | 2026-09-15 | the enforcers, not the pages                                                                  |
| `content/docs` — `resource`                                    | 2026-09-06 |                                                                                               |
| `content/docs` — `esbabbler`                                   | 2026-09-06 |                                                                                               |
| `content/docs` — `architecture`                                | 2026-09-06 |                                                                                               |
| `content/docs` — `virrun`                                      | 2026-09-06 | `wsl.exe` in prose is the command, not a constant the code should have carried                |
| `content/docs` — the product areas                             | 2026-09-06 |                                                                                               |
| `content/docs` — the rest                                      | 2026-09-06 | `proposals`, `infra`, `users`, `achievements`, the root index                                 |
