---
name: pinia
description: Esposter Pinia store conventions — full store name, destructure with storeToRefs, store-to-store dot-access for refs (methods may be destructured), and CRUD patterns (findIndex guard, Object.assign update, filter delete). Apply when using or writing Pinia stores.
---

# Pinia Store Conventions

## Usage in Vue Components

- **Full descriptive store variable name** — `const fileTableEditorStore = useFileTableEditorStore()`, never `const store = ...`. Exception: conditional assignment where the store type varies at runtime.
- **`storeToRefs` and `defineStore` are auto-imported** — never `import { storeToRefs } from "pinia"`.
- **In components**: assign the store to a named variable first (`const roleStore = useRoleStore()`), then destructure. Never destructure directly from the `useXxxStore()` call. Keep each store's lines grouped — fully extract one store before the next. Never batch all inits, then all refs, then all methods. Order per store:
  1. `const xyzStore = useXyzStore()`
  2. `const { ref1, ref2 } = storeToRefs(xyzStore)` _(omit if no refs/computeds)_
  3. `const { method1 } = xyzStore` _(omit if no methods)_

  ```typescript
  // each store fully extracted before the next
  const blockStore = useBlockStore();
  const { blockedUsers } = storeToRefs(blockStore);
  const { blockUser, unblockUser } = blockStore;

  const friendStore = useFriendStore();
  const { friends } = storeToRefs(friendStore);
  const { deleteFriend } = friendStore;
  ```

- Never use dot-access (`store.method()`) in components.
- **Store-to-store** (inside a Pinia store file): declare nested stores at the root of the setup function (avoid calling `useXxxStore()` repeatedly inside actions — prevents repeated lookups). Access refs/computeds via dot syntax (`otherStore.someRef`) to keep reactivity — **never `storeToRefs` inside a store**. Methods **must** be destructured at the root: `const { methodName } = otherStore`. Never call `otherStore.methodName()` inline.

  ```typescript
  // nested store declared at root + method destructured at root
  const friendStore = useFriendStore();
  const { storeCreateFriend } = friendStore;
  storeCreateFriend(user);

  // refs/computeds via dot-access (never storeToRefs inside a store)
  const roomParticipants = computed(() => roomParticipantsMap.value.get(roomStore.currentRoomId));
  ```

## Store as Single Source of Truth — Eliminate Watches and Prop Threading

Reactive state shared across a component tree belongs in the store, not local refs. Local refs + watches to sync state signal the data should live in the store.

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

Children read `selectedRoleId`/`selectedRole` from the store directly — no prop threading, no `defineModel` + `watchImmediate`. Deletion reflects automatically (computed returns `null` when the role is gone). No component-level watches to reset on selection change.

### Eliminating Watches with `:key`

When a child has **local mutable state initialized from a prop** (e.g. `permissions = ref(role.permissions)`), don't watch the prop to reset it — use `:key`:

```vue
<!-- WRONG: watch in RoleEditor syncing permissions when role prop changes -->
watch(() => role.permissions, (newPermissions) => { permissions.value = newPermissions; });

<!-- CORRECT: :key remounts RoleEditor on selection change (guarded — selectedRole is nullable) -->
<RoleEditor v-if="selectedRole" :key="selectedRole.id" :role="selectedRole" :room-id />
```

The remounted component always initializes from the fresh prop.

### Eliminating Prop Threading

When children need store state, have them read the store directly — don't thread props to pass store data down:

```vue
<!-- WRONG: Index threads selectedRoleId → RoleList → RoleListItem as isActive prop -->
<RoleList :roles :selected-role-id @select="selectRole($event)" />

<!-- CORRECT: RoleListItem reads selectedRoleId from store directly -->
const roleStore = useRoleStore(); const { selectedRoleId } = storeToRefs(roleStore); // template: :active="role.id ===
selectedRoleId"
```

This also drops the emit chain — `RoleListItem` calls `selectRole()` directly instead of emitting up.

## useDataMap

Use `useDataMap<T>(currentId, defaultValue)` for state keyed by an id **when there's a meaningful "current" id** (e.g. `currentRoomId`). It provides `getDataMap`, `setDataMap`, `data`, `initializeData`, `resetData`; `data` is tied to the current key.

**Do NOT use** `useDataMap` when the store reads/writes arbitrary keys with no "current" concept — use a plain `ref(new Map<string, T>())` with a manual getter.

```typescript
// useDataMap — "current room" concept applies
const roomStore = useRoomStore();
const { data: notificationType, setDataMap } = useDataMap(
  () => roomStore.currentRoomId,
  NotificationType.DirectMessage,
);

// Manual Map — any key can be accessed (roles loaded per room on demand)
const rolesMap = ref(new Map<string, RoomRole[]>());
const getRoles = (roomId: string) => rolesMap.value.get(roomId) ?? [];
```

**Generic usage** — pass the explicit type generic when the default alone can't infer the full type (unions, empty `{}`/`[]`). Primitives with unambiguous defaults (`""`, `0`, `true`) don't need one. Never use an as-cast instead of the generic.

```typescript
// CORRECT — generic for union / complex types
const { data: pendingSlashCommand } = useDataMap<null | SlashCommand>(() => roomStore.currentRoomId, null);
const { data: parameterValues } = useDataMap<Record<string, string>>(() => roomStore.currentRoomId, {});
const { data: errors } = useDataMap<SlashCommandParameterError[]>(() => roomStore.currentRoomId, []);

// primitive default infers — no generic needed
const { data: trailingMessage } = useDataMap(() => roomStore.currentRoomId, "");
```

## Cursor Pagination in Stores

Three helpers — pick by type and keying needs:

| Helper                                       | When to use                                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------------------- |
| `useCursorPaginationData<T>()`               | `T extends ToData<AEntity>` (has top-level `id` or `partitionKey`/`rowKey`)        |
| `useCursorPaginationOperationData(ref(...))` | Any `T` — wrap the ref yourself; layer `createOperationData` on top for typed CRUD |
| `useCursorPaginationDataMap<T>(currentId)`   | same store holds per-key lists (e.g. pinned messages per room)                     |

`createOperationData` supports any entity type — `EntityIdKeys<T>` resolves to `["id"]` (SQL entities extending `AItemEntity`), `["partitionKey","rowKey"]` (Azure entities), or `(keyof T & string)[]` as a fallback. `Ban` uses `(roomId, userId)` composite PK — always pass both keys exactly matching the DB primary key:

```typescript
// useBanStore — cursor pagination + createOperationData for typed delete
const { hasMore, items, readItems, readMoreItems } = useCursorPaginationOperationData(cursorPaginationData);
const { deleteBan: storeDeleteBan } = createOperationData(items, ["roomId", "userId"], DatabaseEntityType.Ban);

const deleteBan = async (input: UnbanUserInput) => {
  await $trpc.moderation.unbanUser.mutate(input);
  storeDeleteBan({ roomId: input.roomId, userId: input.userId });
};
```

**When to add `storeCreateXxx`/`storeDeleteXxx` subscription handlers:** only when a subscription fires to _all_ affected parties. For bans, `onAdminAction` only fires to the banned user — the moderator initiates the ban, so the store just updates locally after the mutation. No `storeCreateBan` handler needed.

## tRPC Mutation Placement

Do **not** create Pinia actions that only wrap a single `$trpc.xxx.mutate(...)`. Components/composables call `$trpc` directly when the result is handled by subscriptions or no shared state update is needed.

Add a store action only when it adds meaningful client logic:

- Genuine optimistic state before the server responds
- Navigation or local side effects tied to the result
- Shared state updates not covered by subscriptions
- Coordination of multiple stores, requests, or validation steps

```typescript
// subscription owns the state change — call the mutation directly at the user action
$trpc.friend.deleteFriend.mutate(friendId);

// store action justified — adds local state logic after the mutation
const unban = async (userId: string) => {
  await $trpc.moderation.unbanUser.mutate({ roomId, userId });
  items.value = items.value.filter((ban) => ban.userId !== userId);
};
```

## createOperationData Usage

- **Use `createOperationData` wherever the item type satisfies `ToData<AEntity>`** — generates typed CRUD (`createXxx`, `updateXxx`, `deleteXxx`, `pushXxxs`, `unshiftXxxs`) for entity list refs. `User` satisfies this (`id`, `createdAt`, `updatedAt`, `deletedAt` from `pgTable`). Destructure as `base` aliases and wrap in `storeXxx` functions for side effects:

  ```ts
  const friends = ref<User[]>([]);
  const { createFriend: baseStoreCreateFriend, deleteFriend: baseStoreDeleteFriend } = createOperationData(
    friends,
    ["id"],
    DatabaseEntityType.Friend,
  );
  // Wrap to add dedup guard; keep public API taking a plain string
  const storeCreateFriend = (friend: User) => {
    if (!friends.value.some(({ id }) => id === friend.id)) baseStoreCreateFriend(friend);
  };
  const storeDeleteFriend = (friendId: string) => {
    baseStoreDeleteFriend({ id: friendId });
  };
  ```

- **Prefer CRUD verbs over domain-specific verbs** — `deleteBan` not `unban`, `deleteMember` not `kick`. Reserve domain terms only when there's no clean CRUD mapping.
- **`store*` prefix for subscription-driven state-update counterparts** — `storeCreateFriend`/`storeDeleteFriend` for state-only subscription handlers. If the user action is only a direct tRPC call, don't add a matching non-`store*` wrapper.
- **Subscription state-update methods use CRUD prefixes** — `createXxx` to insert, `deleteXxx` to remove. Never `addXxx`:

  ```ts
  const createFriendRequest = (senderUser: User) => {
    if (!friendRequests.value.some(({ id }) => id === senderUser.id))
      friendRequests.value = [senderUser, ...friendRequests.value];
  };
  ```

## CRUD Store Patterns

Follow `createOperationData` conventions exactly for store update/delete methods:

- **update**: `findIndex` first, guard `if (index === -1) return`, then mutate in place with `Object.assign(takeOne(items.value, index), updatedItem)`.
- **delete**: reassign the array — `items.value = items.value.filter(...)` — never `splice`.
- Always guard a missing parent ref before any operation: `if (!parentRef.value) return`.

## CRUD Parameter Naming

Consistent param names across stores, composables, functions (mirrors `createOperationData`'s `newItem`/`updatedItem`/`ids`):

- **create**: `newXxx` — `createRow(newRow?: Row)`, `createColumn(newColumn: Column | DateColumn)`
- **update**: `updatedXxx` — `updateRow(updatedRow: Row)`, `updateColumn(updatedColumn: ToData<Column | DateColumn>)`
- **delete**: just `id` — typically only the identifier. Exception: when extra context is required (e.g. `deleteColumn(name: string)`), use the most natural identifier name.

## tRPC Input Types — Pass Full Object, Never Split

Store action params mirror the tRPC input type directly. Never split a shared field (e.g. `roomId`) out as a separate argument with `Except<Input, "roomId">` for the rest. Pass the full input as a single argument and spread it to the mutation.

```typescript
// single input matching the tRPC type
const createRole = async (input: CreateRoleInput) => {
  const newRole = await $trpc.role.createRole.mutate(input);
};
```

Call sites pass the full object inline:

```typescript
await createRole({ roomId, id: selectedRole.value.id, permissions: pendingPermissions.value });
```

## Minimal Input Pattern for Store Actions

Store action params = minimum input required (typically just an ID). The full entity comes from the **API response**, not the caller. Design tRPC mutations to return the affected entity when the store needs it for local state.

```typescript
// caller passes only the ID; entity comes back from the API
const blockUser = async (userId: FriendUserIdInput) => {
  const user = await $trpc.friend.blockUser.mutate(userId);
  blockedUsers.value = [user, ...blockedUsers.value]; // from API
};
```

## Reuse Existing Store Maps — Never Build Local Maps in Actions

When a store action receives entities already cached in another store's map (e.g. `memberMap` in `useMemberStore`), write them into that map directly. Do **not** build a transient local `Map` just to look up values within the same action, and do **not** create a second parallel map ref holding the same data.

```typescript
// write directly into the existing memberMap; look up at display time
const memberStore = useMemberStore(); // declared at store root
const storeMessages = (messages: MessageEntity[], users: User[]) => {
  for (const user of users) memberStore.memberMap.set(user.id, user);
  for (const message of messages) messageMap.value.set(message.rowKey, message);
};
// In displayItems computed, look up creators from memberStore.memberMap directly
```

This keeps a single source of truth for user data.

## Reactive Map Mutations

Vue 3 tracks `Map` mutations (`set`, `delete`, `clear`) on a `ref(new Map(...))` — no need to clone and reassign.

```typescript
// mutate in place — no clone + reassign needed
rolesMap.value.set(roomId, result);
```

## Storing Class Instances — markRaw

Pinia `ref`/`reactive` state is **deep** — pushing a class instance into a reactive array (or assigning it to a reactive field) recursively wraps the instance in a reactive `Proxy`. A `Proxy` **breaks ECMAScript `#` private field/method access**: when a method runs with `this` bound to the Proxy, the `#field` brand check fails with `TypeError: Cannot read private member #x from an object whose class did not declare it`.

Wrap class instances in `markRaw` at the single point they enter reactive state. The container stays reactive (its `length`/identity still drives computeds); only the instance opts out of proxying — correct since command/controller instances hold no reactive state of their own.

```typescript
// store/tableEditor/fileHistory — commands use # private fields, so never let them be proxied
const history = ref<ADataSourceCommand[]>([]); // array stays reactive (length drives isUndoable)
const push = (command: ADataSourceCommand) => {
  history.value.push(markRaw(command)); // markRaw so undo()/execute() can read this.#index etc.
};
```

This is the same pattern used for Phaser objects (`markRaw(new KeyboardControls())`) — see the `vue-phaserjs` skill. Prefer it over downgrading `#` fields to the TS `private` keyword: keep the strictest ECMAScript form and stop the proxying instead. `shallowRef` is not a substitute when the container relies on in-place `.push()`/mutation — shallowRef only tracks `.value` reassignment.

## Optimistic Input Clearing on Submit

Clear local form input **before** `await`-ing the store action so the field empties instantly. Capture the normalized value in a local variable first so clearing doesn't affect the value passed to the store.

```typescript
// clear first (capture the value), then fire — field empties instantly
const submit = async () => {
  const normalizedName = normalizeString(name.value);
  if (!normalizedName) return;
  name.value = "";
  await createRole({ name: normalizedName, permissions: 0n, position: 0, roomId });
};
```

## Session Auth in Stores

Never expose `sessionId` or any raw session identifier as a store state field. Read the session via `authClient.useSession()` instead. In a setup store use the **synchronous** form (no `useFetch`) — the setup function can't `await`, so the `useFetch` form is impossible here:

```ts
// synchronous reactive ref — access as session.value.data
const session = authClient.useSession();
```

The awaited `await authClient.useSession(useFetch)` form is for async, SSR-relevant contexts only (components, async composables, middleware) — see the `vue` skill's Auth Session section.
