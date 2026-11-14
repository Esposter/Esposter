# Message Retention / Pruning

Per-room setting (e.g. 30/90/180 days); the room's object prunes its `messagesInRoom` rows older than the setting, by `createdAt`, from its alarm.

**Why deferred**

- The storage cost of keeping every message row in the room objects is not measured, so it is not a reason either way.
- Adds complexity (a timed prune in each room's object, per-room config, deletion semantics) for a non-problem.

**Revisit when:** the storage cost of the room objects' message rows becomes material, or a room/compliance requirement demands time-bounded retention.
