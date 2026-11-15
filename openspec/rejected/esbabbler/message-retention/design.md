# Message Retention / Pruning

A per-room setting, such as 30, 90 or 180 days, under which the room's object prunes its `messagesInRoom` rows older than the setting, by `createdAt`, from its alarm.

## Why not

Nothing measured makes the storage of message rows a problem, and a timed prune would add a prune in every room's object, a per-room setting and deletion semantics for it to earn. Reopened when a room or compliance requirement demands time-bounded retention, or the room objects' message storage is measured as material.
