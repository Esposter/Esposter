---
name: pinia
description: Esposter Pinia store conventions — full store name, destructure with storeToRefs, store-to-store dot-access for refs (methods may be destructured), per-service dialog stores, blade-scoped store state torn down on unmount, never redirecting store functions through wrappers, selection state in the store, useDataMap vs a plain Map and keying every field of per-key state, tRPC mutation placement via useMutation with a required key and optimistic rollback, single-flight reads via isExclusive (never a promise map or a chained promise in a store), CRUD verbs and store* subscription handlers, CRUD update/delete mechanics and parameter naming, full tRPC input objects, minimal-input actions, reusing existing store maps, reactive Map mutations, markRaw for class instances, optimistic input clearing, session auth in stores, plus deep dives on keyed state and cursor pagination, worked mutation actions, and cross-surface state with hook registries. Apply when writing or reviewing any Pinia store, or deciding whether logic belongs in a store.
---

# Pinia Store Conventions

## Consuming a Store

Applies **everywhere a store is consumed** — components, composables, services and **tests alike**. Tests are not exempt: a test that reaches into a store differently from the code it covers stops being a description of how the store is used.

- **Full descriptive store variable name** — `const fooBarStore = useFooBarStore()`, never `const store = ...`. Exception: conditional assignment where the store type varies at runtime.
- **`storeToRefs` and `defineStore` are auto-imported** — never `import { storeToRefs } from "pinia"`.
- Assign the store to a named variable first, then destructure. **Never destructure directly from the `useXxxStore()` call** — neither `storeToRefs(useFooStore())` nor `const { method } = useFooStore()`.
- Keep each store's lines grouped — fully extract one store before the next, never all inits, then all refs, then all methods. Order per store: `const xyzStore = useXyzStore()`, then `const { ref1 } = storeToRefs(xyzStore)`, then `const { method1 } = xyzStore` (omit either line if empty).
- Never use dot-access (`store.method()`) in components.
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
- Pass the explicit type generic when the default alone can't infer the full type (unions, empty `{}`/`[]`); primitives with unambiguous defaults don't need one. Never an as-cast instead of the generic.

## tRPC Mutation Placement

Do **not** create Pinia actions that only wrap a single `$trpc.xxx.mutate(...)` — components/composables call `$trpc` directly when the result is handled by subscriptions or no shared state update is needed. Add a store action only when it adds meaningful client logic: genuine optimistic state, navigation or local side effects tied to the result, shared state updates subscriptions don't cover, or coordination of multiple stores/requests/validation steps.

A store action that mutates goes through `useMutation` (`composables/shared/useMutation.ts`):

- **Declare every instance at the store root** — `const { executeMutation } = useMutation()`. Never inside an action (detached effect scope leak).
- **One `useMutation()` instance per mutation**, via destructure renames (`executeCreateFooMutation`, plus `isPending: isCreateFooPending` / `getIsPending: getIsFooPending` when consumed), so one action's queue and pending state can't hold up another's. **Two mutations that end the same row share one instance instead**, named for the target — the rule and the test for which case you are in are in `packages/app/content/docs/architecture/async-operations.md` § A key queues only within one `useMutation()` instance.
- **Never hand-roll the alert/rollback/pending wiring** — it surfaces errors via `createAlert` unless you pass `onError`, and runs writes to one `key` one at a time so two actions writing different fields of the same entity both land. Destructure `isPending` only where a control consumes it; the in-flight guard decision tree lives in `packages/app/content/docs/architecture/client-data.md` § In-flight guarding.
- **`key` is required on every call** — like a Pinia store id, identity is always explicit, and same key means those writes queue.
- **`applyOptimistic`** applies the change immediately and **returns its rollback**, which runs automatically on failure. The snapshot is taken **inside** the callback, and the rollback undoes **its own write, never the list** — both traps, and why, are in `references/mutation-actions.md`.
- **`onSuccess`** is for server-generated results that can't be predicted client-side (a created entity with its id).
- **A store never orders its own async work** — no promise chained onto the previous one, no `Map<id, Promise>` of in-flight reads, no generation counter or `isSaving` flag. That ordering lives in the primitive, keyed by target; a store that seems to need its own needs the right `key`. Protection applied by hand is protection that gets forgotten.
- **A read that must not be issued twice at once passes `isExclusive: true` to `executeQuery`.** Concurrent callers **join** one request and all get the data — a read is never dropped, which would leave the joiner rendering an empty list. It joins only what is still in flight, so read-once semantics stay a separate cache flag the action checks first, and an invalidating re-read omits the opt-in so it cannot join the answer it just invalidated.

## CRUD Conventions

- **Prefer CRUD verbs over domain-specific verbs** — `deleteBan` not `unban`, `deleteMember` not `kick`. Reserve domain terms only when there's no clean CRUD mapping.
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

## Storing Class Instances — `markRaw`

Pinia state is **deep**, so a class instance pushed into a reactive array is recursively wrapped in a `Proxy`. Two things break: ECMAScript `#` field access (`this` is the Proxy, so the brand check throws `Cannot read private member #x …`), and devtools traversal, which reads every nested getter and crashes on a lazily-initialised one.

Wrap class instances in `markRaw` at the single point they enter reactive state (`history.value.push(markRaw(command))`). The container stays reactive — its length and identity still drive computeds — and only the instance opts out, which is correct since command and controller instances hold no reactive state of their own. Prefer this to downgrading `#` fields to the TS `private` keyword: keep the strictest ECMAScript form and stop the proxying instead. `shallowRef` is not a substitute where the container relies on in-place `.push()`, which it does not track. Applies to any third-party instance holding a live graph (`vue-phaserjs` skill).

## Optimistic Input Clearing on Submit

Clear local form input **before** `await`-ing the store action so the field empties instantly, capturing the normalized value in a local variable first so clearing doesn't affect what is passed to the store.

## Session Auth in Stores

Never expose `sessionId` or any raw session identifier as a store state field. A setup store can't `await`, so it always takes the **synchronous** form: `const session = authClient.useSession()`, accessed as `session.value.data`. Both forms and when each applies: the `vue` skill (`references/auth-session.md`).

## Deep Dives

- `references/keyed-state-and-pagination.md` — when a store keys state by an id, holds a list of entities, or paginates one.
- `references/mutation-actions.md` — when writing a store action that calls a tRPC mutation, or picking its `key`.
- `references/cross-surface-state.md` — when more than one mounted surface displays or mutates the same server-side singular state, or a mutation must fan out to another store.
