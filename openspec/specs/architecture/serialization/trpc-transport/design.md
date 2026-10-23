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

The hook is registered once per process, guarded by a `globalThis` symbol, because a hot reload re-evaluates the transformer on the same SuperJSON instance and would otherwise stack duplicate transformers. Each check looks the class up by name through `getJSONClass`, which reads the map that the class registry publishes on `globalThis`. A hot reload re-creates the classes, and a registration that held the class object would then match nothing, so the lookup has to happen at check time.

The classes it registers come from the shared [class registry](../class-registry/design.md). A value that is not a registered class is not covered by the hook at all, which is the case [unregistered instances](../unregistered-instances/design.md) covers.
