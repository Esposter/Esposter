---
name: pinia
description: Apply when writing or reviewing any Pinia store, or deciding whether logic belongs in a store. Esposter Pinia store conventions — full store names destructured through storeToRefs, dot-access between stores, per-service dialog stores, blade-scoped state torn down on unmount, no store function redirected through a wrapper, selection state in the store, useDataMap with every field of per-key state keyed and a write naming its key where it is issued, tRPC mutations through useMutation with a required key, CRUD verbs with store* subscription handlers, and markRaw on class instances.
---

# Pinia Store Conventions

## Settled — do not re-propose

- **A rule for a ref destructured off a store without `storeToRefs`** — `const { rooms } = roomStore` and `const { createRoom } = roomStore` are the same syntax, and which loses reactivity is a fact about the field's type (`restrictedStoreSyntaxes.js`); the dot read a component makes is the decidable half and is banned.
- **A rule for optimistic rollback correctness** — needs the whole write path in mind.

## Consuming a Store

Everywhere a store is consumed, tests included (`references/consuming-a-store.md`):

- **One binding per store, named after it**, then `storeToRefs(fooStore)` and `const { method } = fooStore`, each store's lines grouped before the next (`pinia-store/require-store-binding`).
- **Never dot-access a store in a component** (`no-restricted-syntax`); inside a store, declare nested stores at the setup root, read their refs by dot, destructure their methods at the root, and never `storeToRefs`.
- **A store's id is its path under `app/store/`** (`app/store/index.test.ts`).
- **Stores reach each other one way only — no module cycle, auto-imports included** (`import/no-cycle`, `app/moduleCycles.test.ts`).

## Dialog UI State Lives in Per-Service Dialog Stores

Singleton-dialog targets live in a per-service dialog store beside the business store, as strings defaulting to `""` (`references/dialog-stores.md`).

## Blade-Scoped Store State — `references/blade-scoped-state.md`

A store is app-lifetime; a ref a component populates for code outside its subtree is not. **Whatever a component bridges onto a store in setup, its `onUnmounted` un-bridges** — and on a keyed route the teardown takes the id it owned and is a no-op when the store has moved on. Bridging or tearing one down: that page.

## Never Redirect Store Functions — Use Them Directly

A store function is destructured and called where it is used, never forwarded through a composable or wrapper (`pass-through-helper/no-forwarding-wrapper`); a store cannot be generic, so a generic member is a generic method (`references/no-redirects.md`).

## Selection State Belongs in the Store

The selected **id** is store state with `""` as nothing selected, owned by the store's own mutations (`references/selection-state.md`).

## Keyed State — `useDataMap` vs a Plain Map

`useDataMap` when there is a meaningful current id, a plain `ref(new Map())` otherwise; a factory for a class default, every field of per-key state keyed, and a write naming its key where it is issued (`references/keyed-state-and-pagination.md`).

## tRPC Mutation Placement

A store action that only wraps one `$trpc` mutate is not written — the caller calls `$trpc`; one that mutates goes through `useMutation` with a required `key` (`references/mutation-actions.md`).

## CRUD Conventions

CRUD verbs over domain verbs, `store*` for a subscription-driven counterpart, update in place after a `findIndex` guard, delete by reassigning (`references/crud.md`).

## Store Action Inputs

An action takes the tRPC input object whole, and only the minimum — the entity comes back in the response (`references/action-inputs.md`).

## Reuse Existing Store Maps — Never Build Local Maps in Actions

Entities another store caches are written through that store's setter — never a transient local `Map` or a parallel map ref (`references/reuse-store-maps.md`).

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
- `references/cross-surface-state.md` — when more than one mounted surface displays or mutates the same server-side singular state, a mutation must fan out to another store, or a caller has to await something a singleton component finishes.
- `references/class-instances-in-state.md` — when a class or third-party instance is pushed into store state.
- `references/blade-scoped-state.md` — when a component populates a store ref for code outside its subtree, or tears one down on a keyed route.
- `references/consuming-a-store.md` — when anything takes a store in: the binding, the grouping, dot-access, store-to-store, and the module cycle.
- `references/dialog-stores.md` — when a singleton dialog needs a target, or a dialog store is created.
- `references/no-redirects.md` — when a layer is about to re-expose a store function, or a type parameter tempts keeping state in a composable.
- `references/selection-state.md` — when a component tree has a selected item.
- `references/crud.md` — when naming or writing a store's create, update, delete or `store*` method.
- `references/action-inputs.md` — when writing a store action's parameters.
- `references/reuse-store-maps.md` — when an action receives entities another store already caches.
