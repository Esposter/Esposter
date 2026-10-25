# Hook registries

Read when a mutation must fan out to a side effect owned by another store, or when a hook registry is created or fired.

Every registry is created with `createHookRegistry<THook>()` (`apps/web/app/services/shared/createHookRegistry.ts`), which returns `{ hooks, register, run }` — **never export a raw module-level hook array**. Store factories re-run per SSR request while the registry is module-scoped, so raw `.push()` leaks server memory; `register` centralizes the `checkIsServer()` no-op (hooks only fire from client-side interactions).

- Stores call `.register(hook)` at setup; orchestrators fan out with `await registry.run(...args)`, or iterate `registry.hooks` directly from a sync context.
- Keyed variants are plain objects/Records of registries (`FooHookMap[Operation.Create].register(...)`).
- Route **every** mutation path through the one store function that fires the hooks — optimistic apply, rollback, `onSuccess`, and subscription handlers. Reads that hydrate from the server bypass it, since server-computed aggregates already include them.

## Hook ordering is a parameter, not a constant

When the same store function is both the optimistic path and the subscription handler, **whether the entity is applied before or after the hooks run is a parameter** (`storeCreateFoo(entity, isOptimistic)`). An optimistic caller applies first — it has a placeholder to keep responsive and a rollback if the hooks reject. A remote entity waits for them, or it renders with whatever state the hooks were supposed to resolve (empty urls, missing author) until they land, and forever if they fail.
