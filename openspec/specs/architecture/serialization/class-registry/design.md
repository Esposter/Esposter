# Class registry

All three transport paths share one source of truth for which classes serialize: `apps/web/shared/services/superjson/JSONClassMap.ts`. The paths are on [serialization](../README.md).

Adding a new serializable class requires a single entry in that map. The SSR and tRPC paths pick it up automatically. The Azure Table path does not read this map: it selects the concrete class per `type` discriminant through `MessageTypeEntityMap` in `@esposter/db-schema`, so new message entity types are registered there separately (see [Azure Table read](../azure-table-path/design.md)).

Registry keys are frozen: `JSONClassMap` keys are persisted inside serialized payloads, so renaming a registered class name breaks revival of existing data — treat the map keys as an on-disk format. The map's shorthand entries take each key from the class's own name, so `JSONClassMap.test.ts` writes the key list out and a rename fails it rather than silently moving a key.

This is why a class name may legitimately disagree with the feature name around it. `FlowchartEditor`, `EmailEditor` and `WebpageEditor` keep the `…Editor` suffix — and their `store/`/`models/`/`services/` folders keep the matching names — even though those products are resources rendered by one explorer ([resources](../../resource/design.md)). The name is a registry key holding persisted blobs readable, so a rename sweep stops at the map: rename the surrounding folder if it helps, never the registered class.
