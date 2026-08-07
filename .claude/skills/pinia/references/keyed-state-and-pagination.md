# Keyed state, entity lists and cursor pagination

Read when a store keys state by an id, holds a list of entities, or paginates one. The rules that always apply — `useDataMap` vs a plain Map, factory defaults, keying every field of per-key state, CRUD verbs and `store*` naming — are in `SKILL.md`; this page is the shapes.

## `useDataMap`

`useDataMap<T>(currentId, defaultValue)` provides `getDataMap`, `setDataMap`, `data`, `initializeData`, `resetData`; `data` is tied to the current key. `useCursorPaginationDataMap`/`useOffsetPaginationDataMap` are thin wrappers that pass a factory default for their class instance.

```typescript
// useDataMap — "current room" concept applies
const roomStore = useRoomStore();
const { data: notificationType, setDataMap } = useDataMap(
  () => roomStore.currentRoomId,
  NotificationType.DirectMessage,
);

// Manual Map — an entity cache keyed by arbitrary id, with no "current" concept
const userMap = ref(new Map<string, User>());
const storeUser = (user: User) => {
  userMap.value.set(user.id, user);
};
```

Generic usage — the explicit generic goes on the unions and empty containers, never an as-cast:

```typescript
// CORRECT — generic for union / complex types
const { data: pendingSlashCommand } = useDataMap<null | SlashCommand>(() => roomStore.currentRoomId, null);
const { data: parameterValues } = useDataMap<Record<string, string>>(() => roomStore.currentRoomId, {});
const { data: errors } = useDataMap<SlashCommandParameterError[]>(() => roomStore.currentRoomId, []);

// primitive default infers — no generic needed
const { data: trailingMessage } = useDataMap(() => roomStore.currentRoomId, "");
```

Selection state uses the same primitive — the selected id is `useDataMap(() => parentStore.currentId, "")` and the selected entity a `computed` that `find`s it, so mutations set the id directly (`setSelectedFooId(input.parentId, newFoo.id)` from a create's `onSuccess`) rather than emitting.

## Cursor pagination helpers

| Helper                                       | When to use                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------- |
| `useCursorPaginationData<T>()`               | single list per store; any `T` (unconstrained)                                        |
| `useCursorPaginationOperationData(ref(...))` | you already own the ref (e.g. from a keyed map); layer `createOperationData` for CRUD |
| `useCursorPaginationDataMap<T>(currentId)`   | same store holds per-key lists (e.g. pinned messages per room); built on `useDataMap` |

## `createOperationData`

Use it **wherever the item type satisfies `ToData<AEntity>`** — it generates typed CRUD (`createXxx`, `updateXxx`, `deleteXxx`, `pushXxxs`, `unshiftXxxs`) for an entity list ref. `User` satisfies this (`id`, `createdAt`, `updatedAt`, `deletedAt` from `pgTable`).

`EntityIdKeys<T>` resolves to `["id"]` (SQL entities extending `AItemEntity`), `["partitionKey","rowKey"]` (Azure entities), or `(keyof T & string)[]` as a fallback. Always pass keys matching the DB primary key exactly — a composite PK passes both.

```typescript
// cursor pagination + createOperationData for a typed, composite-key delete
const { hasMore, items, readItems, readMoreItems } = useCursorPaginationData<BanInMessageWithRelations>();
const { deleteBan: storeDeleteBan } = createOperationData(items, ["roomId", "userId"], DatabaseEntityType.Ban);
```

Destructure as `base` aliases and wrap in `storeXxx` functions when the operation needs side effects or a guard, keeping the public API a plain identifier:

```ts
const friends = ref<User[]>([]);
const { createFriend: baseStoreCreateFriend, deleteFriend: baseStoreDeleteFriend } = createOperationData(
  friends,
  ["id"],
  DatabaseEntityType.Friend,
);
const storeCreateFriend = (friend: User) => {
  if (!friends.value.some(({ id }) => id === friend.id)) baseStoreCreateFriend(friend);
};
const storeDeleteFriend = (friendId: string) => {
  baseStoreDeleteFriend({ id: friendId });
};
```

**When to add `storeCreateXxx`/`storeDeleteXxx` subscription handlers:** only when a subscription fires to _all_ affected parties. For bans, `onAdminAction` only fires to the banned user — the moderator initiates the ban, so the store just updates locally after the mutation, and no `storeCreateBan` handler is needed.
