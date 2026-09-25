# Azure Table

Partition and row keys, reverse-ticked timestamps, batched and conditional writes, `serializeClauses`, bounded counts, and soft delete.

| Unit                                                                                                 | Swept | Notes |
| ---------------------------------------------------------------------------------------------------- | ----- | ----- |
| `packages/db/src/services/azure/table`                                                               | —     |       |
| `packages/db/src/services` — `message`, `resource`                                                   | —     |       |
| `packages/azure`, `packages/azure-mock`, `packages/db-schema/src/models/azure`                       | —     |       |
| `server/services/azure/table`, `server/composables/azure/table`, `server/services/pagination/cursor` | —     |       |
| `server/services/message`                                                                            | —     |       |
| `server/services/program`, `resource`, `survey`                                                      | —     |       |
| `server/trpc` — the table reads and writes                                                           | —     |       |
| `apps/functions`                                                                                     | —     |       |
