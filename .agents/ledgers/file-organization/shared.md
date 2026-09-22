# Shared

`apps/web/shared`, `app/components/Styled` and `packages/shared` — what both halves of the app read.

| Unit                                                                   | Swept      | Notes                                                               |
| ---------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------- |
| `packages/shared`, `packages/shared-node`                              | 2026-09-22 |                                                                     |
| `shared/services`, `shared/util`                                       | 2026-09-22 | `getSynchronizedFunction`'s second export is the exclusion below    |
| `shared/models/db`                                                     | 2026-09-22 |                                                                     |
| `shared/models/resource`                                               | 2026-09-22 |                                                                     |
| `shared/models/dungeons`                                               | 2026-09-22 |                                                                     |
| `shared/models` — `clicker`, `dashboard`, `dataset`, `flowchartEditor` | 2026-09-22 |                                                                     |
| `shared/models` — the rest                                             | 2026-09-22 | the small folders, several of them a single file                    |
| `app/components/Styled`                                                | 2026-09-22 | a `*Props.ts` beside its component is colocation, not a stray model |
