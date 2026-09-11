# Keyed state, entity lists and cursor pagination

Read when a store keys state by an id, holds a list of entities, or paginates one. The rules that always apply — `useDataMap` vs a plain Map, factory defaults, keying every field of per-key state, CRUD verbs and `store*` naming — are in `SKILL.md`; this page is the shapes.

## `useDataMap`

`useDataMap<T>(currentId, defaultValue)` provides `data`, `getBoundData`, `getData`, `getDataRef`, `initializeData`, `resetData`, `setData`. `useCursorPaginationDataMap`/`useOffsetPaginationDataMap` are thin wrappers that pass a factory default for their class instance.

Which of the three views you take is the whole of the keying rule (`SKILL.md`):

| Accessor          | Points at                    | Use for                                                        |
| ----------------- | ---------------------------- | -------------------------------------------------------------- |
| `data`            | whichever key is current now | rendering, and nothing else                                    |
| `getDataRef(key)` | the key you name             | any write — the operation names its key where it is **issued** |
| `getBoundData()`  | the key current _right now_  | a read issued for the current key whose response lands later   |

```typescript
// useDataMap — "current foo" concept applies
const fooStore = useFooStore();
const { data: barType, setData } = useDataMap(() => fooStore.currentFooId, BarType.Baz);

// Manual Map — an entity cache keyed by arbitrary id, with no "current" concept
const entityMap = ref(new Map<string, Foo>());
const storeEntity = (entity: Foo) => {
  entityMap.value.set(entity.id, entity);
};
```

Generic usage — the explicit generic goes on the unions and empty containers, never an as-cast:

```typescript
// CORRECT — generic for union / complex types
const { data: pendingFoo } = useDataMap<null | Foo>(() => fooStore.currentFooId, null);
const { data: fooValues } = useDataMap<Record<string, string>>(() => fooStore.currentFooId, {});
const { data: errors } = useDataMap<FooError[]>(() => fooStore.currentFooId, []);

// primitive default infers — no generic needed
const { data: trailingText } = useDataMap(() => fooStore.currentFooId, "");
```

Selection state uses the same primitive — the selected id is `useDataMap(() => parentStore.currentId, "")` and the selected entity a `computed` that `find`s it, so mutations set the id directly (`setSelectedFooId(input.parentId, newFoo.id)` from a create's `onSuccess`) rather than emitting.

## Every field is keyed, and a write names its key

**State describing one key must be keyed by it — a plain `ref` is only correct when the key cannot change under the store.** A global ref outlives the switch: at the moment the current id changes it still holds the previous key's value, so anything asking "is this the current key's data" reads a stale yes, and consumers grow guards over ambiguous state instead of getting an answer. Applies to **every field** of that state, not just the list — a keyed list beside global counts is the same bug, half-fixed (see `apps/web/content/docs/esbabbler/offline-cache.md`).

**A write names its key; only a read may be ambient.** The `items`/`data` a keyed map hands back tracks whichever key is current, so an `onSuccess`, an optimistic rollback or a late read response landing after the key moved would file one key's rows under another's — a room's emoji appearing in the room the user navigated to. `useCursorPaginationDataMap` types its ambient `items` `readonly` so that write does not compile: a writer comes only from `getSlice(key)` (`getDataRef(key)`, or `getBoundData()` for the current one, on a plain `useDataMap`), and obtaining one means naming the key. **Resolve the slice where the operation is issued, never inside the callback that lands** — a store's writers are typically one `getRoomOperationData(roomId)` helper wrapping `createOperationData(getSlice(roomId).items, …)`. Ordering is the separate half: a read of a target that can be re-entered passes `key: <that id>` to `executeQuery`, so re-entry supersedes the read it interrupted and an A→B→A round cannot land the oldest response last. Why a guard was the wrong shape for this: the `invariants` skill.

## Cursor pagination helpers

| Helper                                       | When to use                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------- |
| `useCursorPaginationData<T>()`               | single list per store; any `T` (unconstrained)                                        |
| `useCursorPaginationOperationData(ref(...))` | you already own the ref (e.g. from a keyed map); layer `createOperationData` for CRUD |
| `useCursorPaginationDataMap<T>(currentId)`   | same store holds per-key lists (e.g. pinned messages per room); built on `useDataMap` |

Both hand out a `CursorPaginationSlice<TItem>` — `{ initializeCursorPaginationData, isLoaded, items }` — through
`getSlice`: `getSlice(key)` on the map, `getSlice()` on the single-list one, so a consumer that only needs one
partition's rows (the IndexedDB pagination caches, above all) takes the same shape from either. That slice is the
**only** writable `items` a keyed store has; the store's ambient `items` is `readonly` and rendering-only.

`isLoaded` is keyed like the rows it describes and lives and dies with them, because an empty list is either "not loaded yet" or "loaded and genuinely empty" and only the load knows which. Held anywhere shorter-lived — a local in whichever composable asks — it starts fresh under a list that did not, and answers for a partition it never watched load.

## `createOperationData`

Use it **wherever the item type satisfies `ToData<AEntity>`** — it generates typed CRUD (`createXxx`, `updateXxx`, `deleteXxx`, `pushXxxs`, `unshiftXxxs`) for an entity list ref. `Foo` satisfies this (`id`, `createdAt`, `updatedAt`, `deletedAt` from `pgTable`).

`EntityIdKeys<T>` resolves to `["id"]` (SQL entities extending `AItemEntity`), `["partitionKey","rowKey"]` (Azure entities), or `(keyof T & string)[]` as a fallback. Always pass keys matching the DB primary key exactly — a composite PK passes both.

```typescript
// cursor pagination + createOperationData for a typed, composite-key delete
const { hasMore, items, readItems, readMoreItems } = useCursorPaginationData<FooWithRelations>();
const { deleteFoo: storeDeleteFoo } = createOperationData(items, ["parentId", "childId"], DatabaseEntityType.Foo);
```

**`createXxx` already dedups on the id keys**, so a repeated echo delivery — an SSE `Last-Event-ID` catch-up, a Web PubSub reconnect replaying its buffer — is idempotent on its own. Never wrap one in a `some(({ id }) => …)` guard: that is the primitive's check written a second time, against a list it is about to re-scan.

Destructure as `base` aliases and wrap in `storeXxx` functions when the operation needs side effects, keeping the public API a plain identifier:

```ts
const foos = ref<Foo[]>([]);
const { createFoo: baseStoreCreateFoo, deleteFoo: baseStoreDeleteFoo } = createOperationData(
  foos,
  ["id"],
  DatabaseEntityType.Foo,
);
const storeCreateFoo = (foo: Foo) => {
  baseStoreCreateFoo(foo);
  registerFooSubscribable(foo.id);
};
const storeDeleteFoo = (fooId: string) => {
  baseStoreDeleteFoo({ id: fooId });
};
```

**When to add `storeCreateXxx`/`storeDeleteXxx` subscription handlers:** only when a subscription fires to _all_ affected parties. When the subscription fires only to one party — the one who did not initiate the mutation — the initiator's store already updated locally after its own mutation, so no `storeCreateXxx` handler is needed.
