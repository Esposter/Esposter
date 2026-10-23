# tRPC transport

The wire path: a registered class instance a procedure returns or receives is carried through the SuperJSON transformer over every tRPC HTTP batch link and WebSocket link. The path and its shared rule are on [serialization](../README.md).

The transformer lives in `apps/web/shared/services/trpc/transformer.ts`. `registerClass` alone does not call `jsonDateParse` on revival, so `registerCustom` is used for each class instead:

```ts
SuperJSON.registerCustom(
  {
    isApplicable: (value) => value instanceof getJSONClass(name),
    serialize: (value) => JSON.stringify(value),
    deserialize: (data) => new (getJSONClass(name))(jsonDateParse(data as string)),
  },
  name,
);
```

The hooks are registered at module load with no guard. SuperJSON keys its custom transformers by name, so a hot reload re-evaluating the transformer on the same SuperJSON instance replaces each one rather than stacking a duplicate. The class map can be evaluated more than once in one process, and each evaluation creates its own classes. Each check matches a value against the class of every evaluation, through `getJSONClasses`, so an instance from any of them is tagged. A value deserializes into the newest evaluation's class, through `getJSONClass`. Both read the maps the class registry publishes on `globalThis`, and both look the class up by name at check time, because a registration that held the class object would match nothing once a hot reload re-creates it.

The classes it registers come from the shared [class registry](../class-registry/design.md). A value that is not a registered class is not covered by the hook at all, which is the case [unregistered instances](../unregistered-instances/design.md) covers.
