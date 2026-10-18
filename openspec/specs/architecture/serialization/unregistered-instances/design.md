# Unregistered instances

SuperJSON annotates nested values by walking the payload, and it only walks **plain** objects and arrays. A class instance it does not recognise is neither registered (so no `registerCustom` hook fires) nor plain (so it is not walked), and it crosses the wire with no annotations for anything inside it — every nested `Date` arrives as a string:

```ts
// hasMore/items survive; items[0].createdAt arrives as a string, not a Date
return new OffsetPaginationData({ hasMore, items });
// annotated as `items.0.createdAt: ["Date"]`, revived as a Date
return { hasMore, items };
```

This is why `getBasePaginationData` and `getCursorPaginationData` return **object literals** typed as their class rather than constructing one. Both classes are pure data holders with no methods, so the literal satisfies the type and the annotations survive. The transport is [tRPC transport](../trpc-transport/design.md).

The failure is silent and only visible at the leaves, which makes it easy to misread as "the transformer isn't wired up". Two rules follow:

- A procedure returns either a **registered** class instance (in [`JSONClassMap`](../class-registry/design.md)) or a **plain object**. Never an unregistered instance.
- A test handler must return the same shape the server does. A fixture that constructs `new SomeClass(...)` where the server returns a literal fails on dates alone, and asserting around it (comparing ids instead of rows) hides the mismatch rather than fixing it.
