# Shared

`apps/web/shared`, `app/components/Styled` and `packages/shared` — what both halves of the app read.

| Unit                                                                   | Swept | Notes                                                               |
| ---------------------------------------------------------------------- | ----- | ------------------------------------------------------------------- |
| `packages/shared`, `packages/shared-node`                              | —     | `getSynchronizedFunction`'s second export is the exclusion below    |
| `shared/services`, `shared/util`                                       | —     |                                                                     |
| `shared/models/db`                                                     | —     |                                                                     |
| `shared/models/resource`                                               | —     |                                                                     |
| `shared/models/dungeons`                                               | —     |                                                                     |
| `shared/models` — `clicker`, `dashboard`, `dataset`, `flowchartEditor` | —     |                                                                     |
| `shared/models` — the rest                                             | —     | the small folders, several of them a single file                    |
| `app/components/Styled`                                                | —     | a `*Props.ts` beside its component is colocation, not a stray model |
