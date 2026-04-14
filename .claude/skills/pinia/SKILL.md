---
name: pinia
description: Esposter Pinia store conventions — full store name, destructure with storeToRefs, store-to-store dot-access for refs (methods may be destructured), and CRUD patterns (findIndex guard, Object.assign update, filter delete). Apply when using or writing Pinia stores.
---

# Pinia Store Conventions

## Usage in Vue Components

- **`storeToRefs` is auto-imported** — never write `import { storeToRefs } from "pinia"`. Same applies to `defineStore` in `.vue` and composable files.
- **Naming**: always use the full descriptive store name — `const fileTableEditorStore = useFileTableEditorStore()`, `const objectStore = useObjectStore()`. Never use `const store = ...` — the only exception is a conditional assignment where the store type varies at runtime (e.g. `const store = isEnemy ? useEnemyStore() : usePlayerStore()`).
- **In Vue components**: always destructure, and keep each store's lines grouped together in this order — fully extract one store before moving to the next. Never batch all store inits, then all storeToRefs, then all methods:
  1. `const xyzStore = useXyzStore()`
  2. `const { ref1, ref2 } = storeToRefs(xyzStore)` _(omit if no refs/computeds needed)_
  3. `const { method1 } = xyzStore` _(omit if no methods needed)_
  4. _(repeat for next store)_

  ```typescript
  // CORRECT — each store fully extracted before moving to the next
  const blockStore = useBlockStore();
  const { blockedUsers } = storeToRefs(blockStore);
  const { blockUser, unblockUser } = blockStore;

  const friendStore = useFriendStore();
  const { friends } = storeToRefs(friendStore);
  const { deleteFriend } = friendStore;

  // WRONG — all inits first, then all storeToRefs, then all methods
  const blockStore = useBlockStore(); // ❌ batched inits
  const friendStore = useFriendStore();
  const { blockedUsers } = storeToRefs(blockStore); // ❌ batched refs
  const { friends } = storeToRefs(friendStore);
  const { blockUser, unblockUser } = blockStore; // ❌ batched methods
  const { deleteFriend } = friendStore;
  ```

- Never use dot-access (`store.method()`) in components.
- **Store-to-store** (inside a Pinia store file): declare nested stores at the root of the setup function — **never call `useXxxStore()` inside an action function**. Pinia requires a reactive context and calling it inside a function (which may run outside Vue's reactivity system) can silently fail or error. Access refs/computeds via dot syntax (`otherStore.someRef`) to maintain reactivity — **never use `storeToRefs` inside a store**. Methods **must** be destructured at the root: `const { methodName } = otherStore`. Never call `otherStore.methodName()` inline — destructure first.

  ```typescript
  // CORRECT — nested store declared at root; method destructured at root
  const friendStore = useFriendStore();
  const { storeCreateFriend, storeDeleteFriend } = friendStore;
  // ...
  storeCreateFriend(user); // use destructured method

  // WRONG — nested store called inside a function
  const someAction = async () => {
    const friendStore = useFriendStore(); // ❌ never inside a function
    friendStore.storeCreateFriend(user); // ❌ dot-access instead of destructure
  };
  ```

  ```typescript
  // WRONG — storeToRefs inside a store
  const { currentRoomId } = storeToRefs(roomStore);
  const roomParticipants = computed(() => roomParticipantsMap.value.get(currentRoomId.value));

  // CORRECT — dot access, no storeToRefs
  const roomParticipants = computed(() => roomParticipantsMap.value.get(roomStore.currentRoomId));
  ```

## useDataMap Generic Usage

Always pass the explicit type generic when the default value alone can't infer the full type (union types, empty `{}` or `[]`). Primitives with unambiguous defaults (`""`, `0`, `true`) don't need a generic.

```typescript
// CORRECT — generic for union / complex types
const { data: pendingSlashCommand } = useDataMap<null | SlashCommand>(() => roomStore.currentRoomId, null);
const { data: parameterValues } = useDataMap<Record<string, string>>(() => roomStore.currentRoomId, {});
const { data: activeParameterNames } = useDataMap<string[]>(() => roomStore.currentRoomId, []);
const { data: errors } = useDataMap<SlashCommandParameterError[]>(() => roomStore.currentRoomId, []);
const { data: lastAddedParameterName } = useDataMap<null | string>(() => roomStore.currentRoomId, null);

// OK — primitive default infers correctly, no generic needed
const { data: trailingMessage } = useDataMap(() => roomStore.currentRoomId, "");
const { data: focusedIndex } = useDataMap(() => roomStore.currentRoomId, 0);

// WRONG — as-cast instead of generic
const { data: pendingSlashCommand } = useDataMap(() => roomStore.currentRoomId, null as null | SlashCommand); // ❌
const { data: parameterValues } = useDataMap(() => roomStore.currentRoomId, {} as Record<string, string>); // ❌
```

## createOperationData Usage

- **Use `createOperationData` wherever the item type satisfies `ToData<AEntity>`** — generates typed CRUD methods (`createXxx`, `updateXxx`, `deleteXxx`, `pushXxxs`, `unshiftXxxs`) for entity list refs. `User` satisfies this (`id`, `createdAt`, `updatedAt`, `deletedAt` from `pgTable` wrapper). Destructure as `base` aliases and wrap in `storeXxx` functions for side effects:

  ```ts
  const friends = ref<User[]>([]);
  const { createFriend: baseStoreCreateFriend, deleteFriend: baseStoreDeleteFriend } = createOperationData(
    friends,
    ["id"],
    DatabaseEntityType.Friend,
  );

  // Wrap to add dedup guard and keep the public API taking a plain string
  const storeCreateFriend = (friend: User) => {
    if (!friends.value.some(({ id }) => id === friend.id)) baseStoreCreateFriend(friend);
  };
  const storeDeleteFriend = (friendId: string) => {
    baseStoreDeleteFriend({ id: friendId });
  };
  ```

- **`store` prefix for state-update-only counterparts of async user actions** — `deleteFriend` (user action) + `storeDeleteFriend` (subscription-driven state update). Never add `store` prefix to unpaired methods:

  ```ts
  // friend.ts — createOperationData wraps base CRUD; store methods add dedup / id-mapping
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
  const deleteFriend = async (friendId) => {
    await $trpc.friend.deleteFriend.mutate(friendId);
    storeDeleteFriend(friendId); // state-only — also used by subscription handlers
  };
  ```

- **Subscription state-update methods use CRUD prefixes** — `createXxx` for inserting into a list, `deleteXxx` for removing. Never use `addXxx` as a prefix:

  ```ts
  const createFriendRequest = (senderUser: User) => {
    if (!friendRequests.value.some(({ id }) => id === senderUser.id))
      friendRequests.value = [senderUser, ...friendRequests.value];
  };
  ```

## CRUD Store Patterns

Follow `createOperationData` conventions exactly when writing store update/delete methods:

- **update**: `findIndex` first, guard `if (index === -1) return`, then mutate in place with `Object.assign(takeOne(items.value, index), updatedItem)`.
- **delete**: reassign the array — `items.value = items.value.filter(...)` — never `splice`.
- Always guard against a missing parent ref before any operation: `if (!parentRef.value) return`.

## Session Auth in Stores

Never expose `sessionId` or any raw session identifier as a store state field. Use `authClient.useSession(useFetch)` to fetch session data — this can be called in both Vue components and Pinia stores:

```ts
// WRONG — session ID leaked into store state
const sessionId = ref<string | null>(null);
const setSessionId = (id: string) => {
  sessionId.value = id;
};

// CORRECT — call useSession wherever needed (component or store)
const { data: session } = await authClient.useSession(useFetch);
```

## Minimal Input Pattern for Store Actions

Store action params = minimum input required (typically just an ID). Full entity comes from the **API response**, not the caller.

```typescript
// WRONG — forces caller to have the full User object upfront
const blockUser = async (user: User) => {
  await $trpc.friend.blockUser.mutate(user.id);
  blockedUsers.value = [user, ...blockedUsers.value]; // user came from caller
};

// CORRECT — caller only passes the ID; entity comes back from the API
const blockUser = async (userId: FriendUserIdInput) => {
  const user = await $trpc.friend.blockUser.mutate(userId);
  blockedUsers.value = [user, ...blockedUsers.value]; // user came from API
};
```

Design tRPC mutations to return the affected entity when the store needs it for local state.

## CRUD Parameter Naming

Use consistent parameter names across stores, composables, and functions:

- **create**: `newXxx` — e.g. `createRow(newRow?: Row)`, `createColumn(newColumn: Column | DateColumn)`
- **update**: `updatedXxx` — e.g. `updateRow(updatedRow: Row)`, `updateColumn(updatedColumn: ToData<Column | DateColumn>)`
- **delete**: just `id` — delete operations typically only need the identifier, not the full object. Exception: when additional context is required (e.g. `deleteColumn(name: string)`), use the most natural identifier name.

This mirrors `createOperationData` which uses `newItem` / `updatedItem` / `ids` for its parameters.
