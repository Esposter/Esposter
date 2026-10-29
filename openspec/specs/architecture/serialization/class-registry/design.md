# Class registry

All three transport paths share one source of truth for which classes serialize: `apps/web/shared/services/superjson/JSONClassMap.ts`. The paths are on [serialization](../README.md).

Adding a new serializable class requires a single entry in that map. The SSR and tRPC paths pick it up automatically. The Azure Table path does not read this map; its message entity types are selected and registered as [Azure Table read](../azure-table-path/design.md) describes.

Registry keys are frozen: `JSONClassMap` keys are persisted inside serialized payloads, so renaming a registered class name breaks revival of existing data — treat the map keys as an on-disk format. The map's shorthand entries take each key from the class's own name, so `JSONClassMap.test.ts` writes the key list out and a rename fails it rather than silently moving a key.

This is why a class name may legitimately disagree with the feature name around it. `FlowchartEditor`, `EmailEditor` and `WebpageEditor` keep the `…Editor` suffix — and their `store/`/`models/`/`services/` folders keep the matching names — even though those products are resources rendered by one explorer ([resources](../../resource/design.md)). The name is a registry key holding persisted blobs readable, so a rename sweep stops at the map: rename the surrounding folder if it helps, never the registered class.

The map is also the lookup the transport checks against, and it is published on `globalThis` on every evaluation of the module rather than once. The dev server evaluates it more than once in one process, and each evaluation creates its own classes, so the registry keeps a weak reference to each evaluation's map. A lookup covers every map still alive, and a value deserializes into the newest one. An evaluation that a hot reload replaces is released with its classes once nothing references it, so the list does not grow on every reload ([tRPC transport](../trpc-transport/design.md)).
