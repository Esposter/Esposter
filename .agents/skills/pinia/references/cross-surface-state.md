# Cross-surface server state

Read when more than one mounted surface can display or mutate the same server-side singular state (one live invite per member per room, one member count per room).

Such state must never live in component-local refs or `useQuery` data — two mounted instances silently diverge the moment one mutates. The ladder, simplest first:

1. **Pinia store map keyed by the parent id** — every surface reads a `computed` over the shared map; mutations write back through a `store*` setter. This alone solves display staleness across surfaces (e.g. `useFooStore.foos` shared by two mounted surfaces that both list and mutate them).
2. **Subscription handlers update the store** — when the data drifts on server events (member joins, role changes), the owning `use*Subscribables` composable writes the store; components never refetch to reconcile.
3. **Hook registry** — only when one typed action/event must fan out to side effects owned by _unrelated_ stores (`FooHookMap` lets a sibling store keep its own counts current on every foo mutation without the foo store importing it). Hooks are for decoupling cross-store side effects, not for keeping shared data in sync — reaching for them where a shared store map suffices adds indirection without fixing ownership. The registry's shape is in `references/hook-registries.md`.
