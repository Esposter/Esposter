# Tooling

The repo's own scripts and the agent tree — code no product area claims, and the gap the eight product areas
left when this ledger was written.

| Unit                                                           | Swept      | Notes                                                                                         |
| -------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| `scripts/src/services/coderabbit/collect`                      | 2026-09-21 | the collector's decision surface                                                              |
| `scripts/src/services/coderabbit` — `feedback`, `shared`       | 2026-09-20 |                                                                                               |
| `scripts/src/services/sweeps` — the scans                      | 2026-09-20 | everything but `ledgerCoverage` and `skillDocs`                                               |
| `scripts/src/services/sweeps` — `ledgerCoverage`, `skillDocs`  | 2026-09-21 | the two that read the ledgers and the skill tree                                              |
| `scripts/src/services/outdatedDependencies`                    | 2026-09-20 |                                                                                               |
| `scripts/src/services/oxlint`                                  | 2026-09-20 |                                                                                               |
| `scripts/src/services/citations`                               | 2026-09-22 |                                                                                               |
| `scripts/src/services/shared`, `dependencyGraph`, `updateNode` | 2026-09-22 |                                                                                               |
| `scripts/src/models`                                           | 2026-09-20 | one type per file, no logic                                                                   |
| `scripts/src/workspace`                                        | 2026-09-20 | the enforcers, not the tooling they hold                                                      |
| `scripts/src` — the entrypoints                                | 2026-09-20 | `citations`, `coderabbit`, `crossOS`, `dependencyGraph`, `refreshLockfile`, `sweeps`          |
| `scripts/src/outdatedDependencies`                             | 2026-09-22 |                                                                                               |
| `scripts/src/oxlint`                                           | 2026-09-22 |                                                                                               |
| `scripts/src/updateNode`                                       | 2026-09-22 |                                                                                               |
| the repository root — config and Markdown                      | 2026-09-21 | the composite actions already carry what the workflows share                                  |
| `apps/web/configuration`                                       | 2026-09-22 | the relative imports are the pre-alias config exception; the splash table is generator output |
| the app's root config files                                    | 2026-09-21 |                                                                                               |
| `content/docs` — the two suites                                | 2026-09-22 | the enforcers, not the pages                                                                  |
| `content/docs` — `resource`                                    | 2026-09-21 |                                                                                               |
| `content/docs` — `esbabbler`                                   | 2026-09-21 |                                                                                               |
| `content/docs` — `architecture`                                | 2026-09-21 |                                                                                               |
| `content/docs` — `virrun`                                      | 2026-09-21 | `wsl.exe` in prose is the command, not a constant the code should have carried                |
| `content/docs` — the product areas                             | 2026-09-21 |                                                                                               |
| `content/docs` — the rest                                      | 2026-09-21 | `proposals`, `infra`, `users`, `achievements`, the root index                                 |
