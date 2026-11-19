# Runtime Efficiency

Where work is placed and how it is shaped — a fact resolved once at the consumer, derivable work off the waited-on path, bounded fan-outs, and tables something deletes from.

| Unit                                                                           | Swept                  | Notes |
| ------------------------------------------------------------------------------ | ---------------------- | ----- |
| `server/trpc/routers/message`, `room`                                          | 2026-10-29 · Haiku 5.5 |       |
| `server/trpc/routers` — the rest                                               | 2026-10-29 · Haiku 5.5 |       |
| `server/trpc` — `middleware`, `procedure`, `plugins`                           | 2026-10-29 · Haiku 5.5 |       |
| `server/services/message`                                                      | 2026-10-29 · Haiku 5.5 |       |
| `server/services/resource`, `room`, `role`, `user`                             | 2026-10-29 · Haiku 5.5 |       |
| `server/services` — the rest                                                   | 2026-10-29 · Haiku 5.5 |       |
| `server/api`, `server/plugins`                                                 | —                      |       |
| `apps/jobs`                                                                    | —                      |       |
| `apps/realtime`                                                                | —                      |       |
| `packages/db`, `packages/db-schema/src/services`                               | —                      |       |
| `packages/keyframe-store`                                                      | —                      |       |
| `scripts/src/services/sweeps`                                                  | —                      |       |
| `scripts/src` — the rest                                                       | —                      |       |
| `packages/genshin-engine` — `terrain`, `streaming`, `vegetation`, `atmosphere` | —                      |       |
| `packages/genshin-engine` — the rest                                           | —                      |       |
| `packages/genshin-world`                                                       | —                      |       |
| `packages/pitch-transcription`                                                 | —                      |       |
| `scripts/src/services/genshinParity`, `scripts/src/services/genshinAssets`     | —                      |       |
