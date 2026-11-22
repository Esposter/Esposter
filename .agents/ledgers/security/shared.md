# Shared

| Unit                 | Notes                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| optimistic rollbacks | every `applyOptimistic` returns a rollback or `noop` with the reason it cannot; the server half is `withResourceRollback` |
