# tRPC transport

The wire path: a registered class instance a procedure returns or receives is carried through the SuperJSON transformer over every tRPC HTTP batch link and WebSocket link. The path and its shared rule are on [serialization](../README.md).

The transformer lives in `apps/web/shared/services/trpc/transformer.ts`. `registerClass` alone does not call `jsonDateParse` on revival, so `registerCustom` is used for each class instead:

```ts
SuperJSON.registerCustom(
  {
    isApplicable: (value): value is InstanceType<typeof cls> => value instanceof cls,
    serialize: (value) => JSON.stringify(value),
    deserialize: (data) => new cls(jsonDateParse(data as string)),
  },
  name,
);
```

The classes it registers come from the shared [class registry](../class-registry/design.md). A value that is not a registered class is not covered by the hook at all, which is the case [unregistered instances](../unregistered-instances/design.md) covers.
