# Achievement client view type

## Why

The achievement definition map's client type claimed the trigger's input schema, but the client never receives it: `readAchievementMap` strips the schema and the predicates before it sends the map. Any client code that read the schema would type-check and fail at runtime.

## What changes

- The client types state the fields a client holds: a view type for a definition, a view map keyed by achievement name, and the entry type the store and the components use.
- The map readers, the store and the router use those types in place of the full map's.

## Out of scope

The serialization fix that stopped the schema breaking the batched request. It shipped separately.
