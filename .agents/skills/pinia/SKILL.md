---
name: pinia
description: Esposter Pinia store conventions — full store name, destructure with storeToRefs, store-to-store dot-access for refs (methods may be destructured), per-service dialog stores, blade-scoped store state torn down on unmount, never redirecting store functions through wrappers, selection state in the store, useDataMap vs a plain Map and keying every field of per-key state, tRPC mutation placement via useMutation with a required key, CRUD verbs and store* subscription handlers, CRUD update/delete mechanics and parameter naming, full tRPC input objects, minimal-input actions, reusing existing store maps, reactive Map mutations, optimistic input clearing, session auth in stores, plus deep dives on keyed state and cursor pagination, wiring a mutation action (instance placement, optimistic rollback, single-flight reads via isExclusive), class instances in reactive state, and cross-surface state with hook registries. Apply when writing or reviewing any Pinia store, or deciding whether logic belongs in a store.
---

# Pinia Store Conventions

## Consuming a Store

Applies **everywhere a store is consumed** — components, composables, services and **tests alike**. Tests are not exempt: a test that reaches into a store differently from the code it covers stops being a description of how the store is used.

- **Full descriptive store variable name** — `const fooBarStore = useFooBarStore()`, never `const store = ...`. **A selector that picks one of several stores at runtime is not an exception**: `useBattleMonsterStore(isEnemy)` returns the player's store or the enemy's, and the binding is still `battleMonsterStore`, because the name says which store the caller asked for rather than which one it got.
- **`storeToRefs` and `defineStore` are auto-imported** — never `import { storeToRefs } from "pinia"`.
- Assign the store to a named variable first, then destructure. **Never destructure directly from the `useXxxStore()` call** — neither `storeToRefs(useFooStore())` nor `const { method } = useFooStore()`.
- Keep each store's lines grouped — fully extract one store before the next, never all inits, then all refs, then all methods. Order per store: `const xyzStore = useXyzStore()`, then `const { ref1 } = storeToRefs(xyzStore)`, then `const { method1 } = xyzStore` (omit either line if empty).
- Never use dot-access (`store.method()`) in components. Enforced: `no-restricted-syntax` in the `.vue` configs bans a member expression on a lower-camel `*Store` identifier, on both the script and template sides.
- **A store's id is its path under `app/store/`**, with a trailing `/index` dropped — `store/resource/sheet/row.ts` is `"resource/sheet/row"`. Asserted by `app/store/index.test.ts`, so a drifting id fails on the line that writes it.
- **Store-to-store** (inside a store file): declare nested stores at the root of the setup function, never `useXxxStore()` inside an action (repeated lookups). Access refs/computeds by dot syntax (`otherStore.someRef`) to keep reactivity — **never `storeToRefs` inside a store**. Methods **must** be destructured at the root (`const { storeCreateFoo } = fooStore`), never called inline as `otherStore.method()`.

```typescript
// each store fully extracted before the next
const fooStore = useFooStore();
const { foos } = storeToRefs(fooStore);
const { createFoo } = fooStore;

const barStore = useBarStore();
const { bars } = storeToRefs(barStore);
const { deleteBar } = barStore;
```

## Dialog UI State Lives in Per-Service Dialog Stores

Singleton-dialog targets (`deletingId`, `editingFooName`, …) never live in a business-logic store — each service gets a dedicated dialog store beside its business store: `store/<feature>/dialog.ts` → `use<Feature>DialogStore` when a feature folder exists, otherwise `<feature>Dialog.ts` beside the business store file (`store/<feature>/fooDialog.ts` → `useFooDialogStore`).

Targets are strings defaulting to `""` (never `undefined`), and components derive `v-model` from them via `useSingletonDialog`. Full pattern: the Singleton Dialogs section in the `vue-page-composition` skill and `packages/app/content/docs/architecture/singleton-dialogs.md`.

## Blade-Scoped Store State — the Owning Component Tears It Down

Some store refs are populated _by a component_ so code outside its subtree can reach them — a live third-party editor instance bridged for a command bar, a staged payload for a confirm dialog. The store is app-lifetime; that state is not. The component that populates such a ref MUST clear it in `onUnmounted` (back to `undefined`/`""`), or the value outlives its blade: a "current" editor that no longer exists silently satisfying guards, a staged dialog re-opening over a different resource with the previous one's data.

Symmetry rule: whatever a component bridges onto a store in setup/`watchImmediate`, its `onUnmounted` un-bridges.

**A teardown on a keyed route takes an id and checks it first.** A page keyed by an entity id is destroyed and recreated when that id changes, and the successor is mounted — and has already loaded its own state — before the predecessor unmounts. An unconditional `onUnmounted` teardown therefore blanks the state the next page just loaded. Pass the id the component owned (`clearFoo(id)`) and make the action a no-op when the store no longer holds it.

**A store cannot be generic, so a type parameter shared by only part of the state is not a reason to keep the whole thing a composable.** Split it: the members whose shape genuinely depends on the parameter take it themselves (a generic _method_, `readContent<ResourceType.Sheet>()`, survives `defineStore` unchanged), and everything identical across parameters becomes plain store state that every surface reads.

## Never Redirect Store Functions — Use Them Directly

A store function is defined **once** and consumed directly at every use site by destructuring it from the store. Never insert a layer that only forwards to it:

- **No alias re-export through a composable** — a composable must never `return { foo: store.foo }`. The consumer destructures the method straight from the store.
- **No one-line wrapper** — never `const selectDevice = (kind, id) => switchDevice(kind, id)` in a store, composable, or component when the body just forwards arguments. Delete it and call the underlying function.
- **No chain of pass-throughs** — `selectDevice → switchDevice → setActiveDevice` collapses to a single `setActiveDevice` that everyone calls.

A composable earns its place **only** when it adds genuine reused behaviour — shared reactive state, multi-step logic, resource lifecycle (`onScopeDispose`), a computed projection — not to re-expose a store's existing API under a new name. Same principle as the mutation-placement rule below: don't add an indirection that carries no logic.

## Selection State Belongs in the Store

When a component tree has a "selected item" concept, the selected **id** is store state — not a local ref threaded down as a prop. Store mutations then own the selection directly (a read initializes it, a create auto-selects it via `onSuccess`), so no component emits or watches are needed.

`""` is the "nothing selected" sentinel and the computed resolves to `undefined` when absent — a stale id is harmless. The sentinel rule (and the `useDataMap(..., "")` form) is owned by the `typescript` skill; `| null` is not an option. The component-side consequences — reading the selection straight from the store instead of prop threading, and `:key` instead of a reset watch — are in the `vue-component-patterns` skill.

## Keyed State — `useDataMap` vs a Plain Map

- Use `useDataMap<T>(currentId, defaultValue)` for state keyed by an id **when there's a meaningful "current" id** (e.g. `currentRoomId`). **Do NOT** use it when the store reads/writes arbitrary keys with no "current" concept — that is a plain `ref(new Map<string, T>())` with a manual getter.
- **Pass a factory** (`() => new CursorPaginationData()`) when the default is a class instance: plain defaults are `structuredClone`d per key so keys never share state, and `structuredClone` strips prototypes.
- **State describing one key must be keyed by it — a plain `ref` is only correct when the key cannot change under the store.** A global ref outlives the switch: at the moment the current id changes it still holds the previous key's value, so anything asking "is this the current key's data" reads a stale yes, and consumers grow guards over ambiguous state instead of getting an answer. Applies to **every field** of that state, not just the list — a keyed list beside global counts is the same bug, half-fixed (see `packages/app/content/docs/esbabbler/offline-cache.md`).
- **A write names its key; only a read may be ambient.** The `items`/`data` a keyed map hands back tracks whichever key is current, so an `onSuccess`, an optimistic rollback or a late read response landing after the key moved would file one key's rows under another's — a room's emoji appearing in the room the user navigated to. `useCursorPaginationDataMap` types its ambient `items` `readonly` so that write does not compile: a writer comes only from `getSlice(key)` (`getDataRef(key)`, or `getBoundData()` for the current one, on a plain `useDataMap`), and obtaining one means naming the key. **Resolve the slice where the operation is issued, never inside the callback that lands** — a store's writers are typically one `getRoomOperationData(roomId)` helper wrapping `createOperationData(getSlice(roomId).items, …)`. Ordering is the separate half: a read of a target that can be re-entered passes `key: <that id>` to `executeQuery`, so re-entry supersedes the read it interrupted and an A→B→A round cannot land the oldest response last. Why a guard was the wrong shape for this: the `invariants` skill.
- Pass the explicit type generic when the default alone can't infer the full type (unions, empty `{}`/`[]`); primitives with unambiguous defaults don't need one. Never an as-cast instead of the generic.

## tRPC Mutation Placement

Do **not** create Pinia actions that only wrap a single `$trpc.xxx.mutate(...)` — components/composables call `$trpc` directly when the result is handled by subscriptions or no shared state update is needed. Add a store action only when it adds meaningful client logic: genuine optimistic state, navigation or local side effects tied to the result, shared state updates subscriptions don't cover, or coordination of multiple stores/requests/validation steps.

A store action that mutates goes through `useMutation` (`composables/shared/useMutation.ts`), and **`key` is required on every call** — like a Pinia store id, identity is always explicit, and the same key queues those writes **within one `useMutation()` instance**: two instances do not serialize against each other however their keys are spelled. Everything else about wiring one — where the instance is declared, one instance per mutation versus two mutations sharing a row, `applyOptimistic` and its rollback, `onSuccess`, and why a store never orders its own async work — is `references/mutation-actions.md`.

## CRUD Conventions

- **Prefer CRUD verbs over domain-specific verbs** — `deleteBan` not `unban`, `deleteRole` not `removeRole`. Reserve domain terms only when there's no clean CRUD mapping.
- **`store*` prefix for subscription-driven state-update counterparts** — `storeCreateFoo`/`storeDeleteFoo`. If the user action is only a direct tRPC call, don't add a matching non-`store*` wrapper. State-update methods use CRUD prefixes (`createXxx` to insert, `deleteXxx` to remove) — never `addXxx`.
- **update**: `findIndex` first, guard `if (index === -1) return`, then mutate in place with `Object.assign(takeOne(items.value, index), updatedItem)`.
- **delete**: reassign the array — `items.value = items.value.filter(...)` — never `splice`.
- Always guard a missing parent ref before any operation: `if (!parentRef.value) return`.
- **Parameter names** mirror `createOperationData` — create takes `newXxx`, update takes `updatedXxx`, delete takes just `id` (or the most natural identifier name when extra context is genuinely required, e.g. `deleteFoo(name: string)`).

## Store Action Inputs

- **Pass the full tRPC input object, never split it.** Store action params mirror the tRPC input type directly — never pull a shared field (`parentId`) out as a separate argument with `Except<Input, "parentId">` for the rest. Call sites pass the whole object inline: `await createFoo({ parentId, id: selectedFoo.value.id, bars: pendingBars.value })`.
- **Minimal input** — params are the minimum required (typically just an id); the full entity comes from the **API response**, not the caller. Design tRPC mutations to return the affected entity when the store needs it for local state.

## Reuse Existing Store Maps — Never Build Local Maps in Actions

When a store action receives entities already cached by another store, write them through that store's own setter. Do **not** build a transient local `Map` just to look up values within the same action, and do **not** create a second parallel map ref holding the same data. `useUserStore` owns the canonical `userMap`; stores holding user-bearing lists destructure `storeUser`/`storeUsers` at their root, write members through them, and look users up at display time. One source of truth for user data.

## Reactive Map Mutations

Vue 3 tracks `Map` mutations (`set`, `delete`, `clear`) on a `ref(new Map(...))` — mutate in place, no clone and reassign.

## Storing Class Instances — `references/class-instances-in-state.md`

Pinia state is deep, so a class instance entering reactive state is recursively proxied — which breaks ECMAScript `#` field access and devtools traversal. Wrap it in `markRaw` at the single point it enters (`history.value.push(markRaw(command))`); read the page before reaching for `shallowRef` or downgrading `#` to `private` instead.

## Optimistic Input Clearing on Submit

Clear local form input **before** `await`-ing the store action so the field empties instantly, capturing the normalized value in a local variable first so clearing doesn't affect what is passed to the store.

## Session Auth in Stores

Never expose `sessionId` or any raw session identifier as a store state field. A setup store can't `await`, so it always takes the **synchronous** form: `const session = authClient.useSession()`, accessed as `session.value.data`. Both forms and when each applies: the `vue` skill (`references/auth-session.md`).

## Deep Dives

- `references/keyed-state-and-pagination.md` — when a store keys state by an id, holds a list of entities, or paginates one.
- `references/mutation-actions.md` — when writing a store action that calls a tRPC mutation, or picking its `key`.
- `references/cross-surface-state.md` — when more than one mounted surface displays or mutates the same server-side singular state, or a mutation must fan out to another store.
- `references/class-instances-in-state.md` — when a class or third-party instance is pushed into store state.
