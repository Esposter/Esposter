# Message Retention / Pruning

Per-room setting (e.g. 30/90/180 days); an Azure Function timer prunes old Azure Table message rows by `createdAt`.

**Why deferred**

- The Azure Table storage cost of keeping every row is not measured, so it is not a reason either way.
- Adds complexity (timer, per-room config, deletion semantics) for a non-problem.

**Revisit when:** Azure Table storage cost becomes material, or a room/compliance requirement demands time-bounded retention.
