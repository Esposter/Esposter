# Message Retention / Pruning

Per-room setting (e.g. 30/90/180 days); an Azure Function timer prunes old Azure Table message rows by `createdAt`.

## Why deferred

- Azure Table storage cost is negligible at current scale.
- Adds complexity (timer, per-room config, deletion semantics) for a non-problem.

## Revisit when

Azure Table storage cost becomes material, or a room/compliance requirement demands time-bounded retention.
