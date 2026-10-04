# Runtime Efficiency

Where work is placed and how it is shaped — a fact resolved once at the consumer, derivable work off the waited-on path, bounded fan-outs, and tables something deletes from.

| Unit                                                                           | Swept                  | Notes |
| ------------------------------------------------------------------------------ | ---------------------- | ----- |
| `server/trpc/routers/message`, `room`                                          | 2026-10-05 · Opus 5.5  |       |
| `server/trpc/routers` — the rest                                               | 2026-09-27 · Opus 5.5  |       |
| `server/trpc` — `middleware`, `procedure`, `plugins`                           | 2026-09-27 · Opus 5.5  |       |
| `server/services/message`                                                      | 2026-09-27 · Opus 5.5  |       |
| `server/services/resource`, `room`, `role`, `user`                             | 2026-09-27 · Opus 5.5  |       |
| `server/services` — the rest                                                   | 2026-09-27 · Opus 5.5  |       |
| `server/api`, `server/plugins`                                                 | 2026-10-05 · Opus 5.5  |       |
| `apps/functions`                                                               | 2026-09-27 · Opus 5.5  |       |
| `packages/db`, `packages/db-schema/src/services`                               | 2026-09-27 · Opus 5.5  |       |
| `packages/virrun`                                                              | 2026-09-27 · Opus 5.5  |       |
| `packages/keyframe-store`                                                      | 2026-10-05 · Opus 5.5  |       |
| `packages/agent-console-server`                                                | 2026-09-27 · Opus 5.5  |       |
| `scripts/src/services/coderabbit`                                              | 2026-09-27 · Opus 5.5  |       |
| `scripts/src/services/sweeps`                                                  | 2026-10-05 · Opus 5.5  |       |
| `scripts/src` — the rest                                                       | 2026-09-27 · Opus 5.5  |       |
| `packages/genshin-engine` — `terrain`, `streaming`, `vegetation`, `atmosphere` | 2026-10-04 · Fable 5.1 |       |
| `packages/genshin-engine` — the rest                                           | 2026-10-04 · Fable 5.1 |       |
| `packages/genshin-world`                                                       | 2026-10-04 · Fable 5.1 |       |
| `packages/pitch-transcription`                                                 | 2026-10-04 · Fable 5.1 |       |
| `scripts/src/services/genshinParity`, `scripts/src/services/genshinAssets`     | 2026-10-05 · Opus 5.5  |       |
