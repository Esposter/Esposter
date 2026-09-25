# Runtime Efficiency

Where work is placed and how it is shaped — a fact resolved once at the consumer, derivable work off the waited-on path, bounded fan-outs, and tables something deletes from.

| Unit                                                 | Swept                 | Notes |
| ---------------------------------------------------- | --------------------- | ----- |
| `server/trpc/routers/message`, `room`                | 2026-09-25 · Opus 5.5 |       |
| `server/trpc/routers` — the rest                     | 2026-09-25 · Opus 5.5 |       |
| `server/trpc` — `middleware`, `procedure`, `plugins` | 2026-09-25 · Opus 5.5 |       |
| `server/services/message`                            | 2026-09-25 · Opus 5.5 |       |
| `server/services/resource`, `room`, `role`, `user`   | 2026-09-25 · Opus 5.5 |       |
| `server/services` — the rest                         | 2026-09-25 · Opus 5.5 |       |
| `server/api`, `server/routes`, `server/plugins`      | 2026-09-25 · Opus 5.5 |       |
| `apps/functions`                                     | 2026-09-25 · Opus 5.5 |       |
| `packages/db`, `packages/db-schema/src/services`     | 2026-09-25 · Opus 5.5 |       |
| `packages/virrun`                                    | 2026-09-25 · Opus 5.5 |       |
| `packages/keyframe-store`                            | 2026-09-25 · Opus 5.5 |       |
| `packages/agent-console-server`                      | —                     |       |
| `scripts/src/services/coderabbit`                    | 2026-09-25 · Opus 5.5 |       |
| `scripts/src/services/sweeps`                        | 2026-09-25 · Opus 5.5 |       |
| `scripts/src` — the rest                             | 2026-09-25 · Opus 5.5 |       |
