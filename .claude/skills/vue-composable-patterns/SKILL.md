---
name: vue-composable-patterns
description: Esposter Vue 3 composable and form patterns — cursor pagination (store + useRead* composable + StyledWaypoint), server search-as-you-type (useAutoSearch/useCursorSearcher, hand-rolling banned), MaybeRefOrGetter vs plain args, the three validation-rule layers (global alias / composable / Ajv keyword), extracting mutation blocks with builder args, permission-gated settings tabs, schema-controlling selectors in #prepend-form, type-driven state reset via create maps, toRawDeep, resource cleanup, useOnline, SSR-safe watches, dirty-check saves with useSave, dialog data loading, capturing the instance before await, use*Subscribables, and the offline IndexedDB pagination cache. Apply when writing or reviewing a composable, form dialog, paginated list, search input, offline cache, or browser-aware reactive code.
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

- `:is-active="hasMore"` — `v-show`n and deactivated when there are no more pages
- `@change="readMoreXxx"` — handler must accept `(onComplete: () => void)` and call `onComplete()` when done (via the `onComplete` arg to `readMoreItems`)
- **Default slot replaces the built-in loader entirely.** The fallback is a `v-progress-circular` rendered only while loading; supplying slot content overrides it and the slot gets **no `isLoading` prop**, so passed skeletons render whenever `isActive` — not just during a fetch. Omit the slot unless you want that always-visible placeholder.

```vue
<StyledWaypoint :is-active="hasMore" @change="readMoreMembers">
  <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
</StyledWaypoint>
```

```typescript
const readMoreBans = (onComplete: () => void) =>
  readMoreItems((cursor) => $trpc.message.moderation.readBans.query({ cursor, limit: LIMIT, roomId }), onComplete);
```

## Server Search-as-You-Type — `useAutoSearch` / `useCursorSearcher` (hand-rolling BANNED)

Hand-rolling search-as-you-type around a `$trpc` search query is **banned** — no per-component `useThrottle`/`refDebounced` + `watch` + `AbortController` + `isSearching` wiring, and no `@input` handlers firing queries. That stack exists exactly once, in `useAutoSearch` (`app/composables/useAutoSearch.ts`): 1s throttle, in-flight request abort, normalized-query change detection, reset-on-empty, an `isPending` ref, and the shared `getResultAsync` → `createAlert` error surfacing from the client-data conventions (superseded/aborted requests stay silent — no consumer writes error handling).

Pick the layer by result shape:

- **Cursor-paginated results** → `useCursorSearcher(query, isAutoSearch?, isIncludeEmptySearchQuery?)` — wraps `useAutoSearch` + `useCursorPaginationData`; the query callback receives `(searchQuery, cursor, opts)` and must forward `opts` (carries the abort signal) to the tRPC call. Both flags are literal `true`-only (never `false`): the 2nd opts into auto-search, and the 3rd makes an empty query list everything (e.g. room pickers) — it only has an effect alongside the 2nd. Returns `{ hasMore, items, readItemsSearched, readMoreItemsSearched, searchQuery }`.
- **Plain array results** → `useAutoSearch(searchQuery, { reset, search })` directly; `search` receives the sanitized query and the `AbortSignal` to forward as `{ signal }`.
- **Ctrl+K palette UI** → wrap in `StyledSearchDialog` (see the vue-component-patterns skill).

```ts
// stores/dialogs with cursor pagination
export const useSearchStore = defineStore("message/room/search", () => {
  const { $trpc } = useNuxtApp();
  return useCursorSearcher((searchQuery, cursor, opts) => {
    const normalizedSearchQuery = normalizeString(searchQuery);
    return $trpc.room.readRooms.query(
      { cursor, filter: normalizedSearchQuery ? { name: normalizedSearchQuery } : undefined },
      opts,
    );
  }, true);
});

// plain array results
const { isPending } = useAutoSearch(searchQuery, {
  reset: () => {
    searchResults.value = [];
  },
  search: async (sanitizedSearchQuery, signal) => {
    searchResults.value = await $trpc.friend.searchUsers.query(sanitizedSearchQuery, { signal });
  },
});
```

The only sanctioned exceptions (documented in `docs/architecture/search.md`):

- **`v-data-table-server` lists** — the table owns fetch orchestration via its `search` prop + `@update:options`; feed it `refDebounced(searchQuery, RESOURCE_SEARCH_DEBOUNCE_MS)` (see `Resource/ListView.vue`).
- **Explicit-submit search** — Enter-triggered with filters + search history (message right-sidebar search); no as-you-type querying to throttle.
- **Client-index search** — MiniSearch/computed over already-loaded data (docs search, portal `useResourceSearchItems`); no server call, so a plain `computed` (optionally `refDebounced`) suffices.

Anything else that looks like a new exception should be refactored onto `useAutoSearch` instead.

## MaybeRefOrGetter vs Function Argument

Use `MaybeRefOrGetter<T>` when the composable **internally reacts** to the value (used inside a `computed`/`watch`) — it must observe changes between calls. Unwrap with `toValue()`. **Naming:** suffix the unwrapped value with `Value`, e.g. `const limitValue = toValue(limit)`.

Use a plain **function argument** on the returned function when the value is just a **pass-through** evaluated at call time (no internal reactive dependency).

```typescript
// CORRECT: MaybeRefOrGetter — composable reacts to the value internally
export const useFooValidation = (foos: MaybeRefOrGetter<Foo[]>, currentName?: string) =>
  computed(() => {
    const foosValue = toValue(foos); // reactive, re-evaluates on change
    return (value: string) => value === currentName || !foosValue.some(({ name }) => name === value);
  });

// CORRECT: plain argument — value passed through at call time
export const useCopyRangeToClipboard = () => {
  return async (rowIds?: string[]) => {
    await copyToClipboard(dataSource, { rowIds });
  };
};
```

Callers pass a getter to stay reactive to prop changes; an optional `currentName` covers "allow own name" for edit vs create.

**Rules:**

- Don't annotate composable return types — let TypeScript infer. Only annotate if inference fails or a contract must be enforced.
- Vue auto-unwraps computed refs in templates, so `:rules="[someRule]"` passes the function value correctly.

## Validation Rules — Pick the Right Layer

Three layers; pick by what the rule depends on.

- **Stateless / simply parameterized** → a global alias in `app/rules.config.ts`, used via `useVRules()` (see the `vuetify` skill).
- **Depends on reactive component state, plain Vuetify form** → a shared composable taking `MaybeRefOrGetter` (above). Extract on the 2nd copy — never duplicate an inline rule across dialogs.
- **Depends on reactive state, but the form is a Vjsf schema** → a custom **Ajv keyword**, not a composable. A rule can't live in the schema as a closure, so the schema _declares_ the keyword and the component _injects_ the validate function at runtime:

  1. Declare the keyword (`services/ajv/keywords/`) — `{ keyword, schemaType, type } as const satisfies KeywordDefinition`, no `validate`.
  2. Tag the field in the Zod schema via `.meta({ [fooKeywordDefinition.keyword]: true })`, and declare the key on `GlobalMeta` in `shared/types/zod.d.ts`.
  3. In the form-options composable, spread the definition and add the reactive `validate` into `ajvOptions.keywords`; the component passes the result as `:options` to `<Vjsf>`.

  Reference wiring: `uniqueColumnNameKeywordDefinition` + `useColumnFormOptions` + `useUniqueColumnNameKeywordDefinitionValidation`.

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

When a dialog has a selector (column type, chart type) that controls **which Vjsf schema** renders, put it in the `#prepend-form` slot — not the default slot alongside schema content. `StyledEditFormDialog` exposes `#prepend-form`, rendered above the `v-form`, so the selector isn't part of the form it reshapes. Canonical: `Dashboard/Visual/Preview/EditFormDialog.vue`.

```vue
<!-- WRONG: type selector mixed into default slot with Vjsf -->
<StyledEditFormDialog ...>
  <v-select v-model="fooType" label="Type" ... />
  <Vjsf v-model="editedFoo" :schema="jsonSchema" />
</StyledEditFormDialog>

<!-- RIGHT: type selector in #prepend-form -->
<StyledEditFormDialog ...>
  <template #prepend-form>
    <v-select v-model="fooType" label="Type" ... />
  </template>
  <Vjsf v-model="editedFoo" :schema="jsonSchema" />
</StyledEditFormDialog>
```

## Type-Driven State Reset: Watch + Create Map

When a "discriminant" ref (type selector) changes and should **reinitialize** a related mutable ref, use `watch` with a **create map** abstracting per-type construction.

**Step 1 — define a create map in services**, keyed by the discriminant, each entry a `create` taking a `Partial` of the target minus its discriminant. The `as const satisfies` mapped type ties each key to its own constructor, so `Map[type].create(...)` returns the right subtype:

```ts
// FooTypeCreateMap.ts
export const FooTypeCreateMap = {
  [FooType.Bar]: { create: (init?: Partial<Except<BarFoo, "type">>) => new BarFoo({ ...init }) },
  [FooType.Baz]: { create: (init?: Partial<Except<BazFoo, "type">>) => new BazFoo({ ...init }) },
} as const satisfies {
  [K in FooType]: { create: (init?: Partial<Except<Extract<Foo, { type: K }>, "type">>) => Foo };
};
```

**Step 2 — use watch + map in the component:**

```ts
const fooType = ref(FooType.Bar);
const editedFoo = ref(FooTypeCreateMap[FooType.Bar].create());

watch(fooType, (newType) => {
  const { name } = editedFoo.value; // preserve fields that survive the type switch
  editedFoo.value = FooTypeCreateMap[newType].create({ name });
});
```

For **external sync** (a parent can reset the model), add a second watch on the model's discriminant field to keep the local type ref in sync:

```ts
watch(
  () => editedFoo.value.type,
  (newType) => {
    fooType.value = newType;
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
// freshly newed instance is already plain — pass it directly
executeAndRecord(new CreateRowCommand(index, newRow));
// clone IS needed for data pulled from reactive stores
const originalRow = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.rows, index)));
```

## Unwrapping Reactive Proxies

Always use `toRawDeep` from `@esposter/shared` instead of Vue's `toRaw` — `toRaw` only unwraps one level; `toRawDeep` recursively unwraps all nested reactive proxies. Critical when passing reactive data to APIs requiring plain objects (IndexedDB `store.put()`, `structuredClone`, postMessage).

## Routing

Route reads, route-synced tabs (`useEnumRouteQuery`), and `definePageMeta` `validate`/`key` for optional segments live in the **routing** skill.

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

## Least API Calls — Dirty-Check Saves (`useSave`)

Every API call must be necessary. Never fire a persistence call (tRPC mutation or localStorage write) when the payload equals what was last persisted. Two silent offenders this kills:

1. **Save-on-mount** — a `watch` on saveable state fires when the load assigns the just-loaded value, immediately re-persisting it.
2. **Unconditional autosave** — an interval that saves every tick even when nothing changed since the last save.

The dirty check is built into `useSave` (`composables/shared/useSave.ts`) — never hand-roll a snapshot or a `set*` wrapper in a store. It takes the state `Ref` plus an optional `toSave` mapper (when the persisted shape differs from the in-memory shape) and returns `{ save, setState }`: `save` skips (returning `true`) when the state's JSON snapshot equals the last persisted one; `setState` assigns loaded state AND resets the snapshot in one call. The snapshot bookkeeping (`markSaved`-style logic) is internal — callers never see it.

```ts
// store — persisted shape differs from in-memory shape: pass toSave
const clicker = ref(new Clicker());
const { save: saveClicker, setState: setClicker } = useSave(clicker, {
  auth: { save: $trpc.clicker.saveClicker.mutate },
  toSave: toClickerSave,
  unauth: { key: LocalStorageKey.ClickerStore, schema: clickerSaveSchema },
});

// store — persisted shape IS the state: omit toSave
const { save: saveDungeons, setState: setDungeons } = useSave(dungeons, { auth, unauth });

// read composable — loads go through the returned setter, never assign the state ref directly
setClicker(toClicker(await $trpc.clicker.readClicker.query()));
```

Rules:

- Loads go through the returned setter (`setState`, renamed per domain: `setClicker`/`setDungeons`) so the snapshot resets — read composables never assign the state ref directly.
- Skipping returns `true` — "already persisted" is success, not failure.
- The snapshot updates only after a **successful** save so failures retry on the next trigger.
- Snapshots are JSON strings (`Serializable.toJSON` handles reactive proxies/class instances) with `updatedAt` excluded — `saveItemMetadata` bumps it as part of saving, so it must not participate in the dirty check.

## Dialog Data Loading

**Do NOT re-fetch on every dialog open.** Trust the Pinia store as source of truth — CRUD flows through tRPC subscriptions which keep the store current. Fetch once on mount; subsequent opens use cached store data.

```typescript
// fetch once on mount — never re-fetch on every dialog open
const { readFriends } = useReadFriends();
await readFriends();
```

The one-time `await readFriends()` in `<script setup>` handles opening the dialog without having visited the friends page first; the store then stays fresh via subscriptions.

## Async Composables — Capture the Instance Before `await`

`<script setup>` top-level `await` is compiled with `withAsyncContext`, so pages/components may freely register hooks and watchers after an `await`. **Composable bodies get no such treatment** — after the first `await` inside an async composable, `getCurrentInstance()` is `null`, lifecycle hooks warn ("no active component instance") and watchers are no longer bound to the component scope.

Pattern (<https://antfu.me/posts/async-with-composition-api> — see `useReadData`, `useGrapesJsEditor`):

```ts
export const useFoo = async () => {
  // https://antfu.me/posts/async-with-composition-api
  const currentInstance = getCurrentInstance();
  const { data: session } = await authClient.useSession(useFetch);
  const { stop, trigger } = watchTriggerable(session, () => {
    /* ... */
  });

  onMounted(() => {
    trigger();
  }, currentInstance);

  // The watcher is registered after an await, so the component scope cannot auto-stop it
  onUnmounted(() => {
    stop();
  }, currentInstance);
};
```

- Capture `getCurrentInstance()` into a `const` **before** the first `await`; pass it as the second argument to every lifecycle hook registered after the await.
- Watchers created after an `await` are not auto-disposed — keep the `stop` handle and call it in `onUnmounted`.
- Subscribable composables use `getOnlineSubscribableContext()` (esbabbler skill), which packages this capture.

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

- **Minimal public surface** — return only the composed operations callers actually use; bookkeeping helpers stay internal. If every caller would pair two returned functions the same way (e.g. assign + `markSaved`), return the composed function (`setState`) instead of the parts.
- **Never use `createSharedComposable`** — VueUse's `createSharedComposable` creates global singletons that bypass Pinia devtools, HMR, and reactive reset. All shared reactive state must live in a Pinia store (`defineStore`). Existing `createSharedComposable` usages should be replaced by a store, or made thin wrappers delegating to the store.
- **Single-function composables return the function directly** — when a composable exposes one function, return it directly: `return async (...) => { ... }`. Callers use `const fn = useX()` not `const { fn } = useX()`.
- **`Promise.resolve(value)` for sync-to-async** — when a sync expression must satisfy a `Promise<T>` return type, use `Promise.resolve(value)` instead of `async () => value`.

## Offline IndexedDB Cache via Pagination Cache Composables

Offline cache mirrors Pinia state, and it is **entirely self-contained**: `usePaginationCache` owns both directions via two watchers — items change → write IndexedDB; partition key changes **while offline** → read IndexedDB and hydrate the store. Nothing else touches the cache.

Consequences that keep this boundary intact:

- **`readItems`/`readMoreItems` know nothing about IndexedDB** — they are plain pagination helpers. Never add cache options to them or push cache behaviour deeper into pagination.
- **Read composables know nothing about the cache either** — there is no read-side cache composable to call. Never call `useOnline`, `readIndexedDb`, or `writeIndexedDb` from a feature read composable; hydration is already automatic.
- `readIndexedDb` / `writeIndexedDb` (`app/services/cache/indexedDb/`) are called **only** from `usePaginationCache`.

**Generic cache composables** (`app/composables/cache/indexedDb/`) — both take one options object and return `{ flush }`:

- `usePaginationCache` — the base; takes `initializeItems`
- `useCursorPaginationCache` / `useOffsetPaginationCache` — wrap it, taking `initializeCursorPaginationData` / the offset equivalent instead

**Feature cache composable pattern** — a thin wrapper reading store refs and returning the generic composable:

```ts
export const useFooCache = () => {
  const fooStore = useFooStore();
  const { foos } = storeToRefs(fooStore);
  const { initializeCursorPaginationData } = fooStore;
  return useCursorPaginationCache({
    configuration: FooIndexedDbStoreConfiguration,
    initializeCursorPaginationData,
    items: foos,
    partitionKey: () => session.value.data?.user.id ?? "",
  });
};
```

- `configuration` — one per file, `as const satisfies IndexedDbStoreConfiguration` (a key path, plus an optional `limit`)
- `getWriteItems` — feature-specific filtering before persisting
- `onHydrate` — companion state updates after an offline hydrate (member counts, user maps)
- `flush()` — returned so tests can await the pending write

`useMessageCache`, `useMemberCache`, `useRoomCache` are the reference shapes. Architecture doc: `packages/app/content/docs/esbabbler/offline-cache.md`.

## Bundle Ancillary Reads with the Primary Read

When a component needs ancillary data (permissions, metadata) alongside a primary list load, bundle the ancillary read inside the primary read composable — not in the component's `onMounted`. `readMyPermissions` and similar belong inside the composable owning the load (`useReadRooms`, `useReadMembers`), called in `Promise.all` alongside other metadata reads. If there is no natural companion read, call it directly in `<script setup>` — still no `onMounted`.

```typescript
// bundle ancillary reads in the owning read composable (useReadRooms.ts) — not a separate component onMounted fetch
const readMyUsersToRooms = useReadMyUsersToRooms();
const readMyPermissions = useReadMyPermissions();
const readRoles = useReadRoles();
const readRooms = () =>
  readItems(async () => {
    const data = await $trpc.room.readRooms.query(currentRoomId.value ? { roomId: currentRoomId.value } : {});
    const roomIds = data.items.map(({ id }) => id);
    if (roomIds.length > 0)
      await Promise.all([readMyUsersToRooms(roomIds), readMyPermissions(roomIds), readRoles(roomIds)]);
    return data;
  });
```

Follow the `useReadMyUsersToRooms` pattern for batch ancillary reads — a composable taking an **array** of ids, early-returning when it is empty, and issuing one batched query rather than N per-id calls.
