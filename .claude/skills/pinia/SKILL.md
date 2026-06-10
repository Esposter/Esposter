---
name: pinia
description: Esposter Pinia store conventions — full store name, destructure with storeToRefs, store-to-store dot-access for refs (methods may be destructured), and CRUD patterns (findIndex guard, Object.assign update, filter delete). Apply when using or writing Pinia stores.
---

# Pinia Store Conventions

## Usage in Vue Components

- **`storeToRefs` is auto-imported** — never write `import { storeToRefs } from "pinia"`. Same applies to `defineStore` in `.vue` and composable files.
- **In Vue components**: always assign the store to a named variable first (`const roleStore = useRoleStore()`), then destructure from it. Never destructure directly from the `useXxxStore()` call. Then keep each store's lines grouped together in this order — fully extract one store before moving to the next. Never batch all store inits, then all storeToRefs, then all methods:
  1. `const xyzStore = useXyzStore()`
  2. `const { ref1, ref2 } = storeToRefs(xyzStore)` _(omit if no refs/computeds needed)_
  3. `const { method1 } = xyzStore` _(omit if no methods needed)_
  4. _(repeat for next store)_

  ```typescript
  // WRONG — destructuring directly from the call, no named store variable
  const { createRole } = useRoleStore(); // ❌

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
- **Store-to-store** (inside a Pinia store file): declare nested stores at the root of the setup function as an Esposter efficiency convention — avoid calling `useXxxStore()` repeatedly inside each action to prevent repeated store lookups. Access refs/computeds via dot syntax (`otherStore.someRef`) to maintain reactivity — **never use `storeToRefs` inside a store**. Methods **must** be destructured at the root: `const { methodName } = otherStore`. Never call `otherStore.methodName()` inline — destructure first.

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

## Store as Single Source of Truth — Eliminate Watches and Prop Threading

**Rule:** Reactive state shared across a component tree belongs in the store, not in local refs. Local refs + watches to sync state are a sign the data should live in the store.

### Selection State

When a component tree has a "selected item" concept (e.g. `selectedRoleId`), put it in the store:

```typescript
// store/message/room/role.ts
const selectedRoleId = ref<string | null>(null);
const selectedRole = computed(() => {
  if (!selectedRoleId.value) return null;
  for (const roles of rolesMap.value.values()) {
    const role = roles.find(({ id }) => id === selectedRoleId.value);
    if (role) return role;
  }
  return null;
});
const selectRole = (id: string) => {
  selectedRoleId.value = id;
};

// Store mutations update selection directly — no emits needed
const readRoles = async (input: ReadRolesInput) => {
  const result = await $trpc.role.readRoles.query(input);
  rolesMap.value.set(input.roomId, result);
  selectedRoleId.value = result[0]?.id ?? null; // init selection
};
const createRole = async (input: CreateRoleInput) => {
  const newRole = await $trpc.role.createRole.mutate(input);
  rolesMap.value.set(input.roomId, [newRole, ...getRoles(input.roomId)]);
  selectedRoleId.value = newRole.id; // auto-select created item
  return newRole;
};
```

Benefits:

- Children read `selectedRoleId`/`selectedRole` from store directly — no prop threading
- No `defineModel` + `watchImmediate` to sync parent ↔ child
- Deletion automatically reflects: `selectedRole` computed returns `null` when the role is gone
- No component-level watches to reset state on selection change

### Eliminating Watches with `:key`

When a child component has **local mutable state initialized from a prop** (e.g. `permissions = ref(role.permissions)`), the naive fix is a watch to reset it when the prop changes. The idiomatic fix is `:key`:

```vue
<!-- WRONG: watch in RoleEditor syncing permissions when role prop changes -->
watch(() => role.permissions, (newPermissions) => { permissions.value = newPermissions; });

<!-- CORRECT: :key forces Vue to remount RoleEditor when selection changes -->
<RoleEditor :key="selectedRole.id" :role="selectedRole" :room-id />
```

The remounted component always initializes from the fresh prop — no watch needed.

### Eliminating Prop Threading

When children need store state, have them read the store directly. Don't thread props just to pass store data down:

```vue
<!-- WRONG: Index threads selectedRoleId → RoleList → RoleListItem as isActive prop -->
<RoleList :roles :selected-role-id @select="selectRole($event)" />

<!-- CORRECT: RoleListItem reads selectedRoleId from store directly -->
<!-- RoleListItem.vue -->
const { selectedRoleId } = storeToRefs(useRoleStore()); // template: :active="role.id === selectedRoleId"
```

This also eliminates the emit chain: `RoleListItem` calls `selectRole()` directly instead of emitting `click` → `RoleList` emitting `select` → parent calling `selectRole`.

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

## Cursor Pagination in Stores

Three helpers — pick based on type and keying needs:

| Helper                                       | When to use                                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------------------- |
| `useCursorPaginationData<T>()`               | `T extends ToData<AEntity>` (has top-level `id` or `partitionKey`/`rowKey`)        |
| `useCursorPaginationOperationData(ref(...))` | Any `T` — wrap the ref yourself; layer `createOperationData` on top for typed CRUD |
| `useCursorPaginationDataMap<T>(currentId)`   | same store holds per-key lists (e.g. pinned messages per room)                     |

**`createOperationData` supports any entity type** — `EntityIdKeys<T>` resolves to `["id"]` (SQL entities extending `AItemEntity`), `["partitionKey","rowKey"]` (Azure entities), or `(keyof T & string)[]` as a generic fallback for any other type. `Ban` uses `(roomId, userId)` composite PK — always pass both keys exactly matching the DB primary key:

```typescript
// useBanStore — layered: cursor pagination + createOperationData for typed delete
const { hasMore, items, readItems, readMoreItems } = useCursorPaginationOperationData(cursorPaginationData);
const { deleteBan: storeDeleteBan } = createOperationData(items, ["roomId", "userId"], DatabaseEntityType.Ban);

const deleteBan = async (input: UnbanUserInput) => {
  await $trpc.moderation.unbanUser.mutate(input);
  storeDeleteBan({ roomId: input.roomId, userId: input.userId });
};
```

`useCursorPaginationOperationData` provides the cursor pagination layer; `createOperationData` provides typed CRUD on top of its `items` ref.

**When to add `storeCreateXxx`/`storeDeleteXxx` driven by subscriptions:** only when a subscription exists that fires to _all_ affected parties. For bans, `onAdminAction` only fires to the banned user — the moderator initiates the ban themselves, so the ban store just updates locally after the mutation. No `storeCreateBan` subscription handler needed.

## tRPC Mutation Placement

Do **not** create Pinia actions that only wrap a single `$trpc.xxx.mutate(...)` call. Components and composables may call `$trpc` directly when the mutation result is handled by subscriptions or no shared state update is needed.

Add a store action only when it adds meaningful client logic:

- Genuine optimistic state before the server responds
- Navigation or local side effects tied to the mutation result
- Shared state updates that are not covered by subscriptions
- Coordination of multiple stores, requests, or validation steps

```typescript
// WRONG — useless wrapper; subscription owns the resulting state change
const deleteFriend = async (friendId: FriendUserIdInput) => {
  await $trpc.friend.deleteFriend.mutate(friendId);
};

// CORRECT — call the mutation directly where the user action happens
$trpc.friend.deleteFriend.mutate(friendId);

// CORRECT — store action adds local state logic after the mutation
const unban = async (userId: string) => {
  await $trpc.moderation.unbanUser.mutate({ roomId, userId });
  items.value = items.value.filter((ban) => ban.userId !== userId);
};
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

- **Prefer CRUD verbs over domain-specific verbs** — `deleteBan` not `unban`, `deleteMember` not `kick`. Reserve domain terms only when there is no clean CRUD mapping.

- **`store*` prefix for subscription-driven state-update counterparts** — use `storeCreateFriend` / `storeDeleteFriend` for state-only subscription handlers. If the user action is only a direct tRPC call, do not add a matching non-`store*` wrapper:

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

## tRPC Input Types — Pass Full Object, Never Split

Store action params mirror the tRPC input type directly. Never split a shared field (e.g. `roomId`) out as a separate argument and use `Except<Input, "roomId">` for the rest. Pass the full input type as a single argument and spread it directly to the mutation.

```typescript
// WRONG — splits roomId out, reconstructs with spread
const createRole = async (roomId: Room["id"], input: Except<CreateRoleInput, "roomId">) => {
  const newRole = await $trpc.role.createRole.mutate({ ...input, roomId });
};

// CORRECT — single input matching the tRPC type
const createRole = async (input: CreateRoleInput) => {
  const newRole = await $trpc.role.createRole.mutate(input);
};
```

Call sites pass the full object inline:

```typescript
// WRONG
await createRole(roomId, { id: selectedRole.value.id, permissions: pendingPermissions.value });

// CORRECT
await createRole({ roomId, id: selectedRole.value.id, permissions: pendingPermissions.value });
```

## Reuse Existing Store Maps — Never Build Local Maps in Actions

When a store action receives a list of entities that are already cached in another store's map (e.g. `memberMap` in `useMemberStore`, `appUserMap` in `useAppUserStore`), write them into that map directly. Do **not** build a transient local `Map` just to look up values within the same action, and do **not** create a second parallel map ref in the store to hold the same data.

```typescript
// WRONG — local userMap built only to populate a parallel creatorMap
const storeMessages = (messages: MessageEntity[], users: User[]) => {
  const userMap = new Map(users.map((u) => [u.id, u])); // ❌ local map
  for (const message of messages) {
    const creator = userMap.get(message.userId);
    if (creator) messageCreatorMap.value.set(message.rowKey, creator); // ❌ duplicated map
  }
};

// CORRECT — write directly into the existing memberMap; look up from it at display time
const memberStore = useMemberStore(); // declared at store root
const storeMessages = (messages: MessageEntity[], users: User[]) => {
  for (const user of users) memberStore.memberMap.set(user.id, user);
  for (const message of messages) messageMap.value.set(message.rowKey, message);
};
// In displayItems computed, look up creators from memberStore.memberMap directly
```

This keeps a single source of truth for user data and avoids duplicating the same entries across multiple maps.

## Reactive Map Mutations

Vue 3 tracks `Map` mutations (`set`, `delete`, `clear`) on a `ref(new Map(...))` — no need to clone and reassign. Call `.set()` directly on `rolesMap.value`.

```typescript
// WRONG — unnecessary clone + reassign
rolesMap.value = new Map(rolesMap.value).set(roomId, result);

// CORRECT — mutate in place; Vue reactivity picks it up
rolesMap.value.set(roomId, result);
```

## Optimistic Input Clearing on Submit

Clear local form input **before** `await`-ing the store action so the field empties instantly rather than waiting for the server round-trip.

```typescript
// WRONG — field stays filled until server responds
const submit = async () => {
  const normalizedName = normalizeString(name.value);
  if (!normalizedName) return;
  await createRole({ name: normalizedName, permissions: 0n, position: 0, roomId });
  name.value = "";
};

// CORRECT — clear first, then fire the request
const submit = async () => {
  const normalizedName = normalizeString(name.value);
  if (!normalizedName) return;
  name.value = "";
  await createRole({ name: normalizedName, permissions: 0n, position: 0, roomId });
};
```

Capture the normalized value in a local variable first so clearing `name` doesn't affect the value passed to the store.

## useDataMap for Key-to-Value State

Use `useDataMap<T>(currentId, defaultValue)` for state keyed by an id **when there is a meaningful "current" id** (e.g. `currentRoomId`) — `useDataMap` provides `getDataMap`, `setDataMap`, `data`, `initializeData`, and `resetData` out of the box. The `data` computed is tied to the current key.

**Do NOT use** `useDataMap` when the store must read/write arbitrary keys with no concept of a "current" one. In that case, a plain `ref(new Map<string, T>())` with a manual getter is correct.

```typescript
// useDataMap — correct when "current room" concept applies (e.g. message input state)
const roomStore = useRoomStore();
const { data: notificationType, setDataMap } = useDataMap(
  () => roomStore.currentRoomId,
  NotificationType.DirectMessage,
);

// Manual Map — correct when any key can be accessed (e.g. roles loaded per room on demand)
const rolesMap = ref(new Map<string, RoomRole[]>());
const getRoles = (roomId: string) => rolesMap.value.get(roomId) ?? [];
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
