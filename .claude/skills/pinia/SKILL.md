---
name: pinia
description: Esposter Pinia store conventions — full store name, destructure with storeToRefs, store-to-store dot-access for refs (methods may be destructured), per-service dialog stores, blade-scoped store state torn down on unmount, never redirecting store functions through wrappers, selection state in the store, useDataMap vs a plain Map, cursor pagination helpers, tRPC mutation placement via useMutation with optimistic rollback, createOperationData CRUD verbs and store* subscription handlers, CRUD/parameter naming, full tRPC input objects, minimal-input actions, reusing existing store maps, reactive Map mutations, markRaw for class instances, and session auth in stores. Apply when writing or reviewing any Pinia store, or deciding whether logic belongs in a store.
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
  const directMessageParticipants = computed(() => directMessageParticipantsMap.value.get(roomStore.currentRoomId));
  ```

## Dialog UI State Lives in Per-Service Dialog Stores

Singleton-dialog targets (`deletingId`, `editingColumnName`, `settingsRoomId`, …) never live in a business-logic store — each service gets a dedicated dialog store next to its business store, following the existing `dialog.ts` / `*Dialog.ts` naming:

- `store/message/dialog.ts` → `useMessageDialogStore`; `store/post/dialog.ts` → `usePostDialogStore` (folder exists → `<folder>/dialog.ts`)
- `store/message/roomCategoryDialog.ts` → `useRoomCategoryDialogStore`; `store/resource/sheet/rowDialog.ts` → `useRowDialogStore` (no feature folder → `<feature>Dialog.ts` beside the business store file)

Targets are strings defaulting to `""` (never `undefined`), and components derive `v-model` from them via `useSingletonDialog`. Full pattern: the Singleton Dialogs section in the `vue-component-patterns` skill and `packages/app/content/docs/architecture/singleton-dialogs.md`.

## Blade-Scoped Store State — the Owning Component Tears It Down

Some store refs are populated _by a component_ so code outside its subtree can reach them — a live third-party editor instance bridged for a command bar, a staged payload for a confirm dialog the component renders. The store is app-lifetime; that state is not. The component that populates such a ref MUST clear it in `onUnmounted` (back to `undefined`/`""`), or the value outlives its blade and leaks across targets: a "current" editor that no longer exists silently satisfying guards, a staged dialog re-opening over a different resource with the previous resource's data.

Symmetry rule: whatever a component bridges onto a store in setup/`watchImmediate`, its `onUnmounted` un-bridges.

## Never Redirect Store Functions — Use Them Directly

A store function is defined **once** and consumed directly at every use site by destructuring it from the store. Never insert a layer that only forwards to it:

- **No alias re-export through a composable** — a composable must never `return { foo: store.foo }` (or `return { foo: someStoreMethod }`). The consumer destructures the method straight from the store.
- **No one-line wrapper** — never write `const selectDevice = (kind, id) => switchDevice(kind, id)` in a store, composable, or component when the body just forwards arguments. Delete it and call the underlying function.
- **No chain of pass-throughs** — `selectDevice → switchDevice → setActiveDevice` collapses to a single `setActiveDevice` that everyone calls.

A composable earns its place **only** when it adds genuine reused behaviour — shared reactive state, multi-step logic, resource lifecycle (`onScopeDispose`), a computed projection — not to re-expose a store's existing API under a new name. If a composable would just relay store methods, drop it and use the store.

```ts
// WRONG: composable relays a store method under a new name
export const useCallDeviceSettings = (definitions) => {
  const { switchDevice } = useLiveKitStore();
  const selectDevice = (kind, id) => switchDevice(kind, id); // pointless redirect
  return { deviceSections, refreshDevices, selectDevice };
};
// component: <List @select="selectDevice" />

// CORRECT: composable returns only its real value; component calls the store method directly
export const useCallDeviceSettings = (definitions) => {
  // ...deviceMap, deviceSections, refreshDevices — genuine shared logic
  return { deviceSections, refreshDevices };
};
// component:
const liveKitStore = useLiveKitStore();
const { setActiveDevice } = liveKitStore;
// template: <List @select="setActiveDevice" />
```

Same principle as [tRPC Mutation Placement](#trpc-mutation-placement) — don't add an indirection that carries no logic.

## Selection State Belongs in the Store

When a component tree has a "selected item" concept, the selected **id** is store state — not a local ref threaded down as a prop. Store mutations then update the selection directly, so no component emits or watches are needed:

```typescript
const { data: selectedFooId, setData: setSelectedFooId } = useDataMap(() => parentStore.currentId, "");
const selectedFoo = computed(() => foos.value.find(({ id }) => id === selectedFooId.value));
const selectFoo = (id: string) => {
  selectedFooId.value = id;
};

// mutations own the selection — read initializes it, create auto-selects
const createFoo = async (input: CreateFooInput) => {
  await executeCreateFooMutation(() => $trpc.foo.createFoo.mutate(input), {
    onSuccess: (newFoo) => {
      setFoos(input.parentId, [newFoo, ...getFoos(input.parentId)]);
      setSelectedFooId(input.parentId, newFoo.id);
    },
  });
};
```

`""` is the "nothing selected" sentinel and the computed resolves to `undefined` when absent — a stale id is harmless. The sentinel rule (and the `useDataMap(..., "")` form) is owned by the `typescript` skill; `| null` is not an option.

The component-side consequences — reading the selection straight from the store instead of prop threading, and `:key` instead of a reset watch — are in the `vue-component-patterns` skill.

## useDataMap

Use `useDataMap<T>(currentId, defaultValue)` for state keyed by an id **when there's a meaningful "current" id** (e.g. `currentRoomId`). It provides `getDataMap`, `setDataMap`, `data`, `initializeData`, `resetData`; `data` is tied to the current key.

**Default value: plain value or factory.** A plain default is `structuredClone`d per key so keys never share state. Pass a **factory** (`() => new CursorPaginationData()`) when the default is a class instance — `structuredClone` strips prototypes, so a plain class-instance default is a bug. `useCursorPaginationDataMap`/`useOffsetPaginationDataMap` are thin wrappers doing exactly this.

**Do NOT use** `useDataMap` when the store reads/writes arbitrary keys with no "current" concept — use a plain `ref(new Map<string, T>())` with a manual getter.

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

| Helper                                       | When to use                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------- |
| `useCursorPaginationData<T>()`               | single list per store; any `T` (unconstrained)                                        |
| `useCursorPaginationOperationData(ref(...))` | you already own the ref (e.g. from a keyed map); layer `createOperationData` for CRUD |
| `useCursorPaginationDataMap<T>(currentId)`   | same store holds per-key lists (e.g. pinned messages per room); built on `useDataMap` |

`createOperationData` supports any entity type — `EntityIdKeys<T>` resolves to `["id"]` (SQL entities extending `AItemEntity`), `["partitionKey","rowKey"]` (Azure entities), or `(keyof T & string)[]` as a fallback. `Ban` uses `(roomId, userId)` composite PK — always pass both keys exactly matching the DB primary key:

```typescript
// cursor pagination + createOperationData for a typed, composite-key delete
const { hasMore, items, readItems, readMoreItems } = useCursorPaginationData<BanInMessageWithRelations>();
const { deleteBan: storeDeleteBan } = createOperationData(items, ["roomId", "userId"], DatabaseEntityType.Ban);

const deleteBan = async (input: DeleteBanInput) => {
  const snapshot = [...items.value];
  await executeMutation(() => $trpc.message.moderation.deleteBan.mutate(input), {
    applyOptimistic: () => {
      storeDeleteBan(input);
      return () => {
        items.value = snapshot;
      };
    },
  });
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

A store action that mutates goes through `useMutation` (`composables/shared/useMutation.ts`) — declare `const executeMutation = useMutation()` at the store root and never hand-roll the alert/rollback wiring. It handles error surfacing (`createAlert` unless you pass `onError`) and discards stale responses, so only the latest call wins.

- **`applyOptimistic`** applies the change immediately and **returns its rollback**, which runs automatically on failure. Snapshot the previous value outside the callback and restore it in the returned closure.
- **`onSuccess`** is for server-generated results that can't be predicted client-side (a created entity with its id) — apply those after the response instead of optimistically.

```typescript
// subscription owns the state change — call the mutation directly at the user action
$trpc.friend.deleteFriend.mutate(friendId);

// store action justified — optimistic local state with automatic rollback
const deleteBan = async (input: DeleteBanInput) => {
  const snapshot = [...items.value];
  await executeMutation(() => $trpc.message.moderation.deleteBan.mutate(input), {
    applyOptimistic: () => {
      storeDeleteBan(input);
      return () => {
        items.value = snapshot;
      };
    },
  });
};
```

Give each mutation in a store its own `useMutation()` instance (`executeCreateFooMutation`, `executeUpdateFooMutation`) so one action's staleness tracking can't cancel another's. Full rationale: `packages/app/content/docs/architecture/client-data.md`.

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

When a store action receives entities already cached by another store, write them through that store's own setter. Do **not** build a transient local `Map` just to look up values within the same action, and do **not** create a second parallel map ref holding the same data.

`useUserStore` owns the canonical `userMap`; stores holding user-bearing lists feed it rather than duplicating it — `useMemberStore` destructures `storeUser`/`storeUsers` at its root and writes members through them, then looks users up at display time.

```typescript
// declared at store root; feed the owning store instead of mirroring its data
const userStore = useUserStore();
const { storeUsers } = userStore;
```

This keeps a single source of truth for user data.

## Cross-Surface Server State — Store Map First, Hooks Only for Side Effects

State the server keeps singular (one live invite per member per room, one member count per room) must never live in component-local refs/`useQuery` data when more than one surface can display or mutate it — two mounted instances silently diverge the moment one mutates. The ladder, simplest first:

1. **Pinia store map keyed by `roomId`** — every surface reads a `computed` over the shared map; mutations write back through a `store*` setter. This alone solves display staleness across surfaces (e.g. `useInviteStore.invites` shared by the Add Friends dialog and Settings → Invites).
2. **Subscription handlers update the store** — when the data drifts on server events (member joins, role changes), the owning `use*Subscribables` composable writes the store; components never refetch to reconcile.
3. **Hook registry** — only when one typed action/event must fan out to side effects owned by _unrelated_ stores (the `AdminActionHookMap`/`MessageHookMap` cases; `topRoleChangeHooks` lets the member store keep its per-role group counts current on every role mutation without the role store importing it). Route every mutation path — optimistic apply, rollback, `onSuccess`, and subscription handlers — through one store function that fires the hooks (`mutateMemberRoles`); reads that hydrate from the server bypass it, since server-computed aggregates already include them. Hooks are for decoupling cross-store side effects, not for keeping shared data in sync — reaching for them where a shared store map suffices adds indirection without fixing ownership.

   Every registry is created with `createHookRegistry<THook>()` (`services/shared/createHookRegistry.ts`), which returns `{ hooks, register, run }` — **never export a raw module-level hook array**. Store factories re-run per SSR request while the registry is module-scoped, so raw `.push()` leaks server memory; `register` centralizes the `getIsServer()` no-op (hooks only fire from client-side interactions). Stores call `.register(hook)` at setup; orchestrators fan out with `await registry.run(...args)`, or iterate `registry.hooks` directly from a sync context (`mutateMemberRoles`). Keyed variants are plain objects/Records of registries (`MessageHookMap[Operation.Create].register(...)`).

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
// store/resource/sheet/history — commands use # private fields, so never let them be proxied
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
