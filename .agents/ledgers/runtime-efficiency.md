# Runtime Efficiency

Where work is placed and how it is shaped — a fact resolved once at the consumer, derivable work off the waited-on path, bounded fan-outs, and tables something deletes from.

| Unit                                                 | Swept | Notes |
| ---------------------------------------------------- | ----- | ----- |
| `server/trpc/routers/message`, `room`                | —     |       |
| `server/trpc/routers` — the rest                     | —     |       |
| `server/trpc` — `middleware`, `procedure`, `plugins` | —     |       |
| `server/services/message`                            | —     |       |
| `server/services/resource`, `room`, `role`, `user`   | —     |       |
| `server/services` — the rest                         | —     |       |
| `server/api`, `server/routes`, `server/plugins`      | —     |       |
| `apps/functions`                                     | —     |       |
| `packages/db`, `packages/db-schema/src/services`     | —     |       |
| `packages/virrun`                                    | —     |       |
| `packages/keyframe-store`                            | —     |       |
| `scripts/src/services/coderabbit`                    | —     |       |
| `scripts/src/services/sweeps`                        | —     |       |
| `scripts/src` — the rest                             | —     |       |
