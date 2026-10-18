# SSR payload

The page-load path: a class instance in Pinia state or `useAsyncData` is serialized into the HTML payload and revived on the client as its class. The path and its shared rule are on [serialization](../README.md).

Registered with Nuxt's payload plugin API in `apps/web/app/plugins/customPayloads.ts`. It fires for any class instance Nuxt serializes into the payload for client hydration:

```ts
definePayloadReducer(name, (data) => data instanceof cls && JSON.stringify(data));
definePayloadReviver(name, (data) => new cls(jsonDateParse(data)));
```

The reducer writes the entity with `JSON.stringify`, so its dates reach the HTML as ISO strings. The reviver passes that string through `jsonDateParse`, which turns the dates back into `Date` objects and constructs `new cls(...)`, so the hydrated value is `instanceof cls` with its methods, not a plain object.
