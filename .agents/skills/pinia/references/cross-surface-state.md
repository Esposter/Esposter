# Cross-surface server state and hook registries

Read when more than one mounted surface can display or mutate the same server-side singular state (one live invite per member per room, one member count per room), when a mutation must fan out to a side effect owned by another store, or when a caller has to **await** something a component finishes.

Such state must never live in component-local refs or `useQuery` data — two mounted instances silently diverge the moment one mutates. The ladder, simplest first:

1. **Pinia store map keyed by the parent id** — every surface reads a `computed` over the shared map; mutations write back through a `store*` setter. This alone solves display staleness across surfaces (e.g. `useFooStore.foos` shared by two mounted surfaces that both list and mutate them).
2. **Subscription handlers update the store** — when the data drifts on server events (member joins, role changes), the owning `use*Subscribables` composable writes the store; components never refetch to reconcile.
3. **Hook registry** — only when one typed action/event must fan out to side effects owned by _unrelated_ stores (`FooHookMap` lets a sibling store keep its own counts current on every foo mutation without the foo store importing it). Hooks are for decoupling cross-store side effects, not for keeping shared data in sync — reaching for them where a shared store map suffices adds indirection without fixing ownership.

## Awaiting a singleton component: the store owns the resolver

A caller that has to wait for a **singleton component** to finish — a dialog the player steps through, an
animation a battle turn runs — cannot hold its own completion callback: the thing that learns it finished is
that component's event, in another part of the tree. The store between them owns the wait.

Shaped as **one awaitable action plus one completion action**, with the resolver a plain `let` in the store's
setup closure:

```ts
let onComplete: (() => void) | undefined;

const playFoo = async (payload: Foo) =>
  await new Promise<void>(
    getSynchronizedFunction(async (resolve) => {
      onComplete = resolve;
      target.value = payload;
      // The gate the caller waits on, so work that fails resolves it rather than stalling everything behind it
      await getResultAsync(() => start()).match(noop, (error) => {
        console.error(error);
        resolve();
      });
    }),
  );

const completeFoo = () => {
  target.value = undefined;
  const resolve = onComplete;
  onComplete = undefined;
  resolve?.();
};
```

The component binds `@complete="completeFoo()"` and knows nothing about a promise; the caller `await`s
`playFoo(...)` and knows nothing about the component. `useDialogStore`'s queued `onComplete` is the reference
implementation, and `useAttackManagerStore` is the same shape.

**Never export the resolver, and never park it in a module-level mutable.** A `export const ExternalFooStore = {
onComplete: undefined as (() => void) | undefined }` beside the store looks like the smallest possible fix and
is three defects: one holder is shared by every Pinia instance, so on the server one request's callback is
another's; the clearing and the calling move to whichever component happens to emit, where forgetting either
wedges the caller forever; and the file now has two exports whose second is a mechanism rather than a value. A
`let` in the setup closure is per-store-instance, unreachable from outside, and reads in one place.

**A `let` is right here and a `ref` is not.** The resolver is not state anything renders, so making it reactive
buys a dependency nobody wants — and the store's own action is the only reader.

## Hook registries

Every registry is created with `createHookRegistry<THook>()` (`services/shared/createHookRegistry.ts`), which returns `{ hooks, register, run }` — **never export a raw module-level hook array**. Store factories re-run per SSR request while the registry is module-scoped, so raw `.push()` leaks server memory; `register` centralizes the `checkIsServer()` no-op (hooks only fire from client-side interactions).

- Stores call `.register(hook)` at setup; orchestrators fan out with `await registry.run(...args)`, or iterate `registry.hooks` directly from a sync context.
- Keyed variants are plain objects/Records of registries (`FooHookMap[Operation.Create].register(...)`).
- Route **every** mutation path through the one store function that fires the hooks — optimistic apply, rollback, `onSuccess`, and subscription handlers. Reads that hydrate from the server bypass it, since server-computed aggregates already include them.

## Hook ordering is a parameter, not a constant

When the same store function is both the optimistic path and the subscription handler, **whether the entity is applied before or after the hooks run is a parameter** (`storeCreateFoo(entity, isOptimistic)`). An optimistic caller applies first — it has a placeholder to keep responsive and a rollback if the hooks reject. A remote entity waits for them, or it renders with whatever state the hooks were supposed to resolve (empty urls, missing author) until they land, and forever if they fail.
