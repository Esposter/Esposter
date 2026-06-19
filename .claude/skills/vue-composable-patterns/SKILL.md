---
name: vue-composable-patterns
description: Esposter-specific Vue 3 composable and form patterns — MaybeRefOrGetter, SSR safety, online/offline, type-driven state reset, resource management, and cursor pagination (store + useRead* composable + StyledWaypoint). Apply when writing composables, form dialogs, paginated lists, or browser-aware reactive code.
---

# Vue Composable & Form Patterns

## Cursor Pagination — Store + Composable + Waypoint

Every paginated list follows a three-layer pattern. **Never load pages directly in a component or store a raw array for paginated data.**

### Layer 1 — Store

Call `useCursorPaginationData<TItem>()` (handles the ref + cast internally). Expose `hasMore`, `items`, `readItems`, `readMoreItems`:

```ts
export const useFooStore = defineStore("feature/foo", () => {
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationData<FooEntity>();
  // mutations update items.value directly (optimistic or after server response)
  return { hasMore, items, readItems, readMoreItems };
});
```

### Layer 2 — `useRead*` Composable

Wrap `readItems` (first page) and `readMoreItems` (subsequent pages) with tRPC calls. The `readMoreItems` callback receives the current `cursor` automatically. Omit `roomId` for global (non-room-scoped) lists.

```ts
export const useReadFoos = (roomId: string) => {
  const { $trpc } = useNuxtApp();
  const fooStore = useFooStore();
  const { readItems, readMoreItems } = fooStore;
  const readFoos = () => readItems(() => $trpc.foo.readFoos.query({ roomId }));
  const readMoreFoos = (onComplete: () => void) =>
    readMoreItems((cursor) => $trpc.foo.readFoos.query({ cursor, roomId }), onComplete);
  return { readFoos, readMoreFoos };
};
```

### Layer 3 — Component / Page

`await readFoos()` at setup time, destructure `hasMore` + `items` via `storeToRefs`, and place `<StyledWaypoint>` at the bottom of the list (inside the container, after all items). It only triggers when `:is-active` is true, so always rendering it is safe.

```vue
<script setup lang="ts">
const { readFoos, readMoreFoos } = useReadFoos(roomId);
const fooStore = useFooStore();
const { hasMore, items } = storeToRefs(fooStore);
await readFoos();
</script>

<template>
  <v-list v-if="items.length > 0">
    <v-list-item v-for="item of items" :key="item.id" ... />
    <StyledWaypoint :is-active="hasMore" @change="readMoreFoos" />
  </v-list>
</template>
```

### Rules

- **Never** store a paginated list as a plain `ref<TItem[]>` — always `CursorPaginationData<TItem>`.
- **Never** call `readItems`/`readMoreItems` from a component directly — always via a `useRead*` composable.
- Optimistic mutations update `items.value` directly (spread for create, filter for delete) — no re-fetch.
- `readMoreItems` appends; `readItems` resets the full `CursorPaginationData` ref (handles navigating back to first page).
- For multi-list pagination (e.g. messages per room) use `useCursorPaginationDataMap` instead of `useCursorPaginationOperationData`.

## StyledWaypoint — Infinite Scroll

Use `<StyledWaypoint>` for cursor-paginated lists instead of a "Load more" button. Never use a manual "Load more" `v-btn` with `isLoadingMore` state — that belongs to `StyledWaypoint`.

- `:is-active="hasMore"` — hides and deactivates when no more pages
- `@change="readMoreXxx"` — handler must accept `(onComplete: () => void)` and call `onComplete()` when done (via the `onComplete` arg to `readMoreItems`)
- Default slot: shown while loading (skeleton items); omit to use the built-in `v-progress-circular`

```vue
<StyledWaypoint :is-active="hasMore" @change="readMoreMembers">
  <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
</StyledWaypoint>
```

```typescript
const readMoreBans = (onComplete: () => void) =>
  readMoreItems((cursor) => $trpc.moderation.readBans.query({ cursor, limit: LIMIT, roomId }), onComplete);
```

## MaybeRefOrGetter vs Function Argument

Use `MaybeRefOrGetter<T>` when the composable **internally reacts** to the value (used inside a `computed`/`watch`) — it must observe changes between calls. Unwrap with `toValue()`. **Naming:** suffix the unwrapped value with `Value`, e.g. `const limitValue = toValue(limit)`.

Use a plain **function argument** on the returned function when the value is just a **pass-through** evaluated at call time (no internal reactive dependency).

```typescript
// CORRECT: MaybeRefOrGetter — composable computes based on the value
export const useColumnNameRule = (columns: MaybeRefOrGetter<DataSource["columns"]>, currentName?: string) =>
  computed(() => {
    const columnsValue = toValue(columns); // reactive, re-evaluates on change
    return (value: string): string | true => {
      if (value !== currentName && columnsValue.some(({ name }) => name === value)) return "Column already exists";
      return true;
    };
  });

// CORRECT: plain argument — value passed through at call time
export const useCopyToClipboard = () => {
  return async (rowIds?: string[]) => {
    await copyToClipboard(dataSource, item, rowIds);
  };
};
```

Callers pass a getter to stay reactive to prop changes (`currentName` covers "allow own name" for edit vs create):

```typescript
const uniqueNameRule = useColumnNameRule(() => dataSource.columns, column.name); // edit
const uniqueNameRule = useColumnNameRule(() => dataSource.columns); // create
```

**Rules:**

- Don't annotate composable return types — let TypeScript infer. Only annotate if inference fails or a contract must be enforced.
- Vue auto-unwraps computed refs in templates, so `:rules="[uniqueNameRule]"` passes the function value correctly.

## Extract Duplicate Validation Rules

When the same validation rule appears in 2+ components, extract to a shared composable immediately — don't copy-paste. The optional `currentName` parameter handles edit vs create:

```typescript
// WRONG: duplicate inline rules in Edit/CreateDialogButton
const uniqueNameRule = (v: string) => v === column.name || !columns.some(...) || 'Column already exists'
// RIGHT: single composable
const uniqueNameRule = useColumnNameRule(() => dataSource.columns, column.name) // edit
```

## Extract Duplicate Mutation Blocks — Builder Arg for Discriminated-Union Inputs

Same mutation block (lookup + guard + `withFinalizerAsync` + `$trpc.x.mutate`) copy-pasted across siblings differing only in payload → extract a composable. When the input is a **discriminated union**, don't type the param `Except<Input, "field">` and spread `{ ...input, field }` — that won't narrow back to the union (TS error, tempts `as`). Pass a **builder** `(field) => Input` so each caller builds a complete union member:

```ts
export const useExecuteAdminAction = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoom } = storeToRefs(roomStore);
  return (getInput: (roomId: string) => ExecuteAdminActionInput, onComplete: () => void) =>
    withFinalizerAsync(async () => {
      if (!currentRoom.value) return;
      await $trpc.message.moderation.executeAdminAction.mutate(getInput(currentRoom.value.id));
    }, onComplete);
};
// caller: @delete="(onComplete) => executeAdminAction((roomId) => ({ roomId, targetUserId: user.id, type: AdminActionType.CreateBan }), onComplete)"
```

Type-safe (literal checked against the union per call site), no `Except`/spread/cast; callers drop the store/`$trpc`/finalizer setup.

## Settings Tab Permissions — Hide at the Tab Level

Permission-gated settings tabs are hidden via `SettingsPermissionMap`, not guarded inside the tab. Individual tab components never check permissions — they render unconditionally (the tab simply isn't shown to users lacking permission). **Do NOT** show "Insufficient permissions" text — hide the tab entirely.

1. Add `[SettingsType.Xxx]: RoomPermission.YYY` to `services/message/settings/SettingsPermissionMap.ts`
2. `LeftSideBar.vue` filters visible tabs via `hasPermission` inside a `computed`
3. The tab component just fetches and renders — no `isPermitted` check

```typescript
export const SettingsPermissionMap: Partial<Record<SettingsType, RoomPermission>> = {
  [SettingsType.Bans]: RoomPermission.BanMembers,
  [SettingsType.AuditLog]: RoomPermission.ManageRoom,
};

// LeftSideBar.vue
const visibleSettings = computed(() =>
  Object.entries(SettingsListItemMap).filter(([settingsType]) => {
    const permission = SettingsPermissionMap[settingsType];
    if (!permission) return true;
    const data = myPermissionsMap.value.get(roomId);
    if (!data) return false;
    return hasPermission(data.permissions, permission, data.isRoomOwner);
  }),
);
```

## Schema-Controlling Selectors in `#prepend-form`

When a dialog has a selector (column type, chart type) that controls **which Vjsf schema** renders, put it in the `#prepend-form` slot — not the default slot alongside schema content. Matches `Dashboard/Visual/Preview/EditFormDialog.vue`. `TableEditorFileEditDialogButton` exposes `#prepend-form`, rendered inside `v-form` before the default slot.

```vue
<!-- WRONG: type selector mixed into default slot with Vjsf -->
<TableEditorFileEditDialogButton ...>
  <v-select v-model="columnType" label="Type" ... />
  <Vjsf v-model="editedColumn" :schema="jsonSchema" />
</TableEditorFileEditDialogButton>

<!-- RIGHT: type selector in #prepend-form -->
<TableEditorFileEditDialogButton ...>
  <template #prepend-form>
    <v-select v-model="columnType" label="Type" ... />
  </template>
  <v-text-field v-model="editedColumn.name" label="Column" ... />
  <Vjsf v-model="editedColumn" :schema="jsonSchema" />
</TableEditorFileEditDialogButton>
```

## Type-Driven State Reset: Watch + Create Map

When a "discriminant" ref (type selector) changes and should **reinitialize** a related mutable ref, use `watch` with a **create map** abstracting per-type construction.

**Step 1 — define a create map in services:**

```ts
// ColumnTypeCreateMap.ts
export const ColumnTypeCreateMap = {
  [ColumnType.Boolean]: { create: (name = "") => new Column<ColumnType.Boolean>({ name, type: ColumnType.Boolean }) },
  [ColumnType.Date]: { create: (name = "") => new DateColumn({ name }) },
  [ColumnType.Number]: { create: (name = "") => new Column<ColumnType.Number>({ name, type: ColumnType.Number }) },
  [ColumnType.String]: { create: (name = "") => new Column({ name }) },
} as const satisfies Record<
  Exclude<ColumnType, ColumnType.Computed>,
  { create: (name?: string) => DataSource["columns"][number] }
>;
```

**Step 2 — use watch + map in the component:**

```ts
const columnType = ref<Exclude<ColumnType, ColumnType.Computed>>(ColumnType.String);
const editedColumn = ref(ColumnTypeCreateMap[ColumnType.String].create());
const resetForm = () => {
  editedColumn.value = ColumnTypeCreateMap[columnType.value].create();
};

watch(columnType, (newType) => {
  const name = editedColumn.value.name; // preserve name; object shorthand needs `name` not `currentName`
  editedColumn.value = ColumnTypeCreateMap[newType].create(name);
});
```

For **external sync** (a parent can reset the model), add a second watch on the model's discriminant field to keep the local ref in sync:

```ts
const transformationType = ref(editedColumn.value.transformation.type);
watch(transformationType, (newType) => {
  editedColumn.value.transformation = ColumnTransformationTypeCreateMap[newType].create();
});
watch(
  () => editedColumn.value.transformation.type,
  (newType) => {
    transformationType.value = newType;
  },
);
```

**Notes:**

- Always initialize the local type ref from the current model value, not a hardcoded default.
- `if (newType === oldType) return;` in a watch callback is always redundant — Vue only fires when the value changes.
- Writable computed is NOT the right tool here — it requires a backing `_ref` and still needs an external sync watch when a parent can reset the model.

## No `structuredClone` / `toRawDeep` on Freshly Newed Instances

Only call `structuredClone(toRawDeep(...))` on data pulled from Vue reactive stores or refs. Freshly constructed class instances are already plain, non-reactive.

```typescript
// WRONG: unnecessary wrapping
executeAndRecord(new CreateRowCommand(index, structuredClone(toRawDeep(newRow))));
// RIGHT: pass the instance directly
executeAndRecord(new CreateRowCommand(index, newRow));
// CORRECT: clone IS needed for data from reactive stores
const originalRow = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.rows, index)));
```

## Unwrapping Reactive Proxies

Always use `toRawDeep` from `@esposter/shared` instead of Vue's `toRaw` — `toRaw` only unwraps one level; `toRawDeep` recursively unwraps all nested reactive proxies. Critical when passing reactive data to APIs requiring plain objects (IndexedDB `store.put()`, `structuredClone`, postMessage).

## Route-Synced Tabs

Sync `v-tabs` state to the URL instead of a plain `ref`, so the active tab survives a refresh and is linkable. Use `useEnumRouteQuery` (`app/composables/shared/route/useEnumRouteQuery.ts`, auto-imported) with the shared `TAB_QUERY_PARAMETER_KEY` key and the enum's value `Set`. It validates against the enum, falling back to the default when the param is missing **or** invalid — raw `@vueuse/router` `useRouteQuery` only falls back when the param is absent, so a hand-edited `?tab=garbage` would otherwise leave no tab active. It also infers the enum type from its arguments, so no generic argument is needed.

```typescript
import { TAB_QUERY_PARAMETER_KEY } from "#shared/services/route/constants";
import { DraftsAndSentTab, DraftsAndSentTabs } from "@/models/message/draftsAndSent/DraftsAndSentTab";

const tab = ref(DraftsAndSentTab.Drafts); // WRONG: loses the tab on refresh
const tab = useEnumRouteQuery(TAB_QUERY_PARAMETER_KEY, DraftsAndSentTabs, DraftsAndSentTab.Drafts); // CORRECT: syncs to ?tab=Drafts
```

Each enum exposes a value `Set` alongside it (`DraftsAndSentTabs`, `PermissionsTabs`, `AchievementStatuses`). Put `useEnumRouteQuery` where the `v-tabs` `v-model` originates. When a child renders the tabs via `defineModel`, keep it in the parent and pass it down as `v-model`.

## Resource Management

- Always clean up in `onUnmounted`: intervals, timeouts, animation frames, event listeners.
- Prefer `VueUse` composables over manual event listeners where possible.

## Online/Offline Detection

- **Always use `useOnline()` from VueUse** — never `navigator.onLine` directly or `getIsServer()` + `navigator.onLine` guards.
- Returns a reactive `Ref<boolean>` that updates on `online`/`offline` events. SSR-safe: defaults to `true` on the server.
- For subscribables (tRPC subscriptions, WebSocket connections), use `useOnlineSubscribable` (combines `useOnline()` + `onMounted` + `watchImmediate` + `onUnmounted` cleanup) — see `composables/shared/useOnlineSubscribable.ts`.

## Browser-Only Composables (SSR Safety)

Regular `watch`/`watchDeep` are SSR-safe — they don't fire until the source changes (client-side only). Set them up directly in `setup()`, not inside `onMounted`. Vue scopes them to the component and disposes on unmount — no manual `WatchHandle[]` + `onUnmounted` cleanup.

```ts
export const useBrowserFeature = () => {
  const someStore = useSomeStore();
  const { someRef } = storeToRefs(someStore);
  const online = useOnline();

  watchDeep(someRef, (value) => {
    // Safe to use indexedDB, etc. here
  });
  watch(someOtherRef, async (value) => {
    if (!value || online.value) return;
    // ...
  });
};
```

**`watchImmediate` is the SSR concern** — it runs the callback during `setup()` (on the server). If the callback accesses browser APIs, use `watchTriggerable` + `onMounted` to defer the first execution (see `useOnlineSubscribable`):

```ts
const { trigger } = watchTriggerable(source, (value) => {
  // Browser-only logic
});
onMounted(async () => {
  await trigger();
});
```

## Dialog Data Loading

**Do NOT re-fetch on every dialog open.** Trust the Pinia store as source of truth — CRUD flows through tRPC subscriptions which keep the store current. Fetch once on mount; subsequent opens use cached store data.

```typescript
// WRONG: re-fetches every open
const { readFriends } = useReadFriends();
watchImmediate(isOpen, async (newIsOpen) => {
  if (newIsOpen) await readFriends();
});

// CORRECT: fetch once on mount
const { readFriends } = useReadFriends();
await readFriends();
```

The one-time `await readFriends()` in `<script setup>` handles opening the dialog without having visited the friends page first; the store then stays fresh via subscriptions.

## Subscribable Composables (`use*Subscribables`)

Composables managing tRPC subscriptions for a feature are named `use{Feature}Subscribables` and live in `composables/{domain}/subscribables/`. Self-registering (no return value), called from the aggregating `useSubscribables()`.

```typescript
// composables/message/subscribables/useCallSubscribables.ts
export const useCallSubscribables = () => {
  // calls useOnlineSubscribable, sets up tRPC subscriptions; no return value
};

// composables/message/subscribables/useSubscribables.ts
export const useSubscribables = async () => {
  await useRoomSubscribables();
  useCallSubscribables();
};
```

Rules:

- Name pattern: `use{Feature}Subscribables` — not `...Channel`, not `...Watcher`.
- Location: `composables/{domain}/subscribables/`.
- No return value — self-registering side effects.
- Always call `useOnlineSubscribable` (not raw `watch`) so subscriptions reconnect after going offline.

## Composable Rules

- **Never use `createSharedComposable`** — VueUse's `createSharedComposable` creates global singletons that bypass Pinia devtools, HMR, and reactive reset. All shared reactive state must live in a Pinia store (`defineStore`). Existing `createSharedComposable` usages should be replaced by a store, or made thin wrappers delegating to the store.
- **Single-function composables return the function directly** — when a composable exposes one function, return it directly: `return async (...) => { ... }`. Callers use `const fn = useX()` not `const { fn } = useX()`.
- **`Promise.resolve(value)` for sync-to-async** — when a sync expression must satisfy a `Promise<T>` return type, use `Promise.resolve(value)` instead of `async () => value`.

## Offline IndexedDB Cache via Pagination Cache Composables

Offline cache should mirror Pinia state. Prefer thin feature-level `use*Cache` composables that delegate to `useCursorPaginationCache` or `useOffsetPaginationCache`. Do **not** add new `readItems` cache options or push IndexedDB behavior deeper into pagination helpers. (`ReadItemsCacheOptions` has been removed; `readItems`/`readMoreItems` are plain pagination helpers that know nothing about IndexedDB or cache configuration.)

**Generic base functions** (`app/services/cache/indexedDb/`):

- `readIndexedDb(configuration, partitionKey)` — reads all items for a partition key
- `writeIndexedDb(configuration, items, partitionKey)` — replaces all items for a partition key (respects `configuration.limit`)
- `resetIndexedDb()` — clears the singleton (used in tests)

**Configuration objects** (one per file, `as const satisfies IndexedDbStoreConfiguration`):

- `MessageIndexedDbStoreConfiguration` — `CompositeAzureKeyPath`, `limit: 50`
- `MemberIndexedDbStoreConfiguration` — `PartitionedIdKeyPath`
- `RoomIndexedDbStoreConfiguration` — `PartitionedIdKeyPath`

**Generic cache composables** (`app/composables/cache/indexedDb/`):

- `useCursorPaginationCache` — watches cursor store items, writes IndexedDB, hydrates offline partition changes
- `useReadCursorPaginationCache` — wraps first-page cursor reads: online query, offline IndexedDB read
- `useOffsetPaginationCache` / `useReadOffsetPaginationCache` — offset equivalents

**Feature cache composable pattern:**

- read store refs with `storeToRefs`
- return `useCursorPaginationCache(...)` or `useOffsetPaginationCache(...)`, passing `configuration`, `items`, `partitionKey`, and the store initializer
- use `getWriteItems` for feature-specific filtering (e.g. loading messages)
- use `onHydrate` for companion state updates (e.g. member counts, user maps)
- return the generic `flush()` from cache composables that tests need to await

**Read composable pattern:**

- create a read helper with `useReadCursorPaginationCache(configuration)` or `useReadOffsetPaginationCache(configuration)`
- call it inside the `readItems` query callback
- put online-only metadata reads inside the online query passed to the cache helper
- do not call `useOnline`, `readIndexedDb`, or `writeIndexedDb` directly from feature read composables

`useMessageCache`, `useMemberCache`, `useRoomCache` are the reference shapes. Architecture doc: `features/esbabbler/specs/cache.md`.

## Bundle Ancillary Reads with the Primary Read

When a component needs ancillary data (permissions, metadata) alongside a primary list load, bundle the ancillary read inside the primary read composable — not in the component's `onMounted`. `readMyPermissions` and similar belong inside the composable owning the load (`useReadRooms`, `useReadMembers`), called in `Promise.all` alongside other metadata reads. If there is no natural companion read, call it directly in `<script setup>` — still no `onMounted`.

```typescript
// WRONG: component fetches permissions separately in onMounted
onMounted(async () => {
  if (!isCreator.value) await readMyPermissions({ roomId: room.id });
});

// CORRECT: bundled in the owning read composable (useReadRooms.ts)
const readMyPermissions = useReadMyPermissions();
const readRooms = () =>
  readItems(
    () => $trpc.room.readRooms.query({ roomId: currentRoomId.value }),
    ({ items }) => {
      const roomIds = items.map(({ id }) => id);
      return Promise.all([readUsersToRooms(roomIds), readMyPermissions(roomIds)]);
    },
  );
```

Follow the `useReadUsersToRooms` pattern for batch ancillary reads — a composable accepting an array of IDs and calling the store method for each in `Promise.all`.
