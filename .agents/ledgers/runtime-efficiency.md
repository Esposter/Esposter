# Runtime Efficiency

Where work is placed and how it is shaped — a fact resolved once at the consumer, derivable work off the waited-on path, bounded fan-outs, and tables something deletes from.

| Unit                                                                           | Notes |
| ------------------------------------------------------------------------------ | ----- |
| `server/trpc/routers/message`, `room`                                          |       |
| `server/trpc/routers` — the rest                                               |       |
| `server/trpc` — `middleware`, `procedure`, `plugins`                           |       |
| `server/services/message`                                                      |       |
| `server/services/resource`, `room`, `role`, `user`                             |       |
| `server/services` — the rest                                                   |       |
| `server/api`, `server/plugins`                                                 |       |
| `apps/jobs`                                                                    |       |
| `apps/realtime`                                                                |       |
| `packages/db`, `packages/db-schema/src/services`                               |       |
| `packages/keyframe-store`                                                      |       |
| `scripts/src/services/sweeps`                                                  |       |
| `scripts/src` — the rest                                                       |       |
| `packages/genshin-engine` — `terrain`, `streaming`, `vegetation`, `atmosphere` |       |
| `packages/genshin-engine` — the rest                                           |       |
| `packages/genshin-world`                                                       |       |
| `packages/pitch-transcription`                                                 |       |
| `scripts/src/services/genshinParity`, `scripts/src/services/genshinAssets`     |       |
