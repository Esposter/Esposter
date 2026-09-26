# CRUD Conventions

Read when naming or writing a store's create, update, delete or subscription-update method.

- **Prefer CRUD verbs over domain-specific verbs** — `deleteBan` not `unban`, `deleteFoo` not `removeFoo`. Reserve domain terms only when there's no clean CRUD mapping.
- **`store*` prefix for subscription-driven state-update counterparts** — `storeCreateFoo`/`storeDeleteFoo`. If the user action is only a direct tRPC call, don't add a matching non-`store*` wrapper. State-update methods use CRUD prefixes (`createXxx` to insert, `deleteXxx` to remove) — never `addXxx`.
- **update**: `findIndex` first, guard `if (index === -1) return`, then mutate in place with `Object.assign(takeOne(items.value, index), updatedItem)`.
- **delete**: reassign the array — `items.value = items.value.filter(...)` — never `splice`.
- Always guard a missing parent ref before any operation: `if (!parentRef.value) return`.
- **Parameter names** mirror `createOperationData` — create takes `newXxx`, update takes `updatedXxx`, delete takes just `id` (or the most natural identifier name when extra context is genuinely required, e.g. `deleteFoo(name: string)`).
