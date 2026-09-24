# Shared

`apps/web/shared`, `app/components/Styled` and `packages/shared` — what both halves of the app read.

| Unit                                                                   | Swept                 | Notes                                                               |
| ---------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------- |
| `packages/shared`, `packages/shared-node`                              | 2026-09-22 · Opus 5   |                                                                     |
| `shared/services`, `shared/util`                                       | 2026-09-24 · Opus 5.5 | `getSynchronizedFunction`'s second export is the exclusion below    |
| `shared/models/db`                                                     | 2026-09-24 · Opus 5.5 |                                                                     |
| `shared/models/resource`                                               | 2026-09-24 · Opus 5.5 |                                                                     |
| `shared/models/dungeons`                                               | 2026-09-24 · Opus 5.5 |                                                                     |
| `shared/models` — `clicker`, `dashboard`, `dataset`, `flowchartEditor` | 2026-09-24 · Opus 5.5 |                                                                     |
| `shared/models` — the rest                                             | 2026-09-24 · Opus 5.5 | the small folders, several of them a single file                    |
| `app/components/Styled`                                                | 2026-09-22 · Opus 5   | a `*Props.ts` beside its component is colocation, not a stray model |
