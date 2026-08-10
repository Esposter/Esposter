---
name: vue-composable-patterns
description: Esposter Vue 3 composable patterns — no pass-through composables (a use* that only re-exposes a store's refs is deleted, consumers use the store directly), minimal public surface, createSharedComposable banned, single-function composables returning the function, inferred return types, MaybeRefOrGetter vs plain args, the three validation-rule layers (global alias / composable / Ajv keyword), extracting duplicate mutation blocks with a builder arg for discriminated-union inputs, permission-gated settings tabs hidden at the tab level, toRawDeep over toRaw and no cloning of freshly newed instances, resource cleanup, useOnline, SSR-safe watches (watchImmediate is the concern), dirty-check saves via useSave (never hand-rolled), async sequencing through the one useMutation primitive (executeQuery latest-wins for reads, executeMutation queued per target for writes — promise chains, in-flight promise maps, generation counters and hand-rolled stale guards banned), plus deep dives on the sequencing opt-ins and useSave mechanics, form-dialog wiring (Ajv keyword injection, schema-controlling selectors, type-driven state reset, dialog data loading), and composable lifecycle (capturing the instance before await, use*Subscribables). Apply when writing or reviewing a composable, a form dialog, or browser-aware reactive code.
---

# Vue Composable & Form Patterns

## Deep dives

- `references/async-sequencing.md` — when a composable issues a read or a write that can overlap another, or persists state that may be unchanged since the last save.
- `references/form-dialogs.md` — when building a dialog that edits an entity: a selector that switches which schema renders, a reset on type change, a Vjsf rule that needs live component state, or the dialog's initial data load.
- `references/composable-lifecycle.md` — when a composable `await`s before registering hooks or watchers, or when wiring a feature's tRPC subscriptions.

## Composable Rules

- **A composable that only re-exposes something is not a composable — delete it.** `useFoo()` whose body is `storeToRefs(useFooStore())`, a single `computed` over one store ref, or a rename of one import buys nothing and costs a layer: the consumer can no longer see where the state lives, the store's own methods are invisible from the call site, and every new field has to be threaded through the wrapper. Use the store directly (`pinia` skill's ordering rules apply). A composable earns its file only when it **composes**: it owns local reactive state, sequences async work, wires a lifecycle hook, or joins two or more sources into something neither provides.
- **Minimal public surface** — return only the composed operations callers actually use; bookkeeping helpers stay internal. If every caller would pair two returned functions the same way (e.g. assign + `markSaved`), return the composed function (`setState`) instead of the parts.
- **Never use `createSharedComposable`** — VueUse's `createSharedComposable` creates global singletons that bypass Pinia devtools, HMR, and reactive reset. All shared reactive state must live in a Pinia store (`defineStore`). Existing usages should be replaced by a store, or made thin wrappers delegating to the store.
- **A bare `ref` at module scope is the same singleton without the name** — a `ref` declared outside the composable's body is process-wide state every caller shares, so it carries every cost `createSharedComposable` is banned for and announces none of them. It belongs in a Pinia store. Before writing one, check whether a store already owns that surface: a module-scope notification `ref` is almost always `useAlertStore` re-implemented, and the re-implementation is how a display surface ends up mounted nowhere while its producer keeps writing to it. Module scope is for constants and `markRaw`ed class instances, never reactive state.
- **Single-function composables return the function directly** — `return async (...) => { ... }`. Callers use `const fn = useX()` not `const { fn } = useX()`.
- **`Promise.resolve(value)` for sync-to-async** — when a sync expression must satisfy a `Promise<T>` return type, never `async () => value`.
- **Don't annotate composable return types** — let TypeScript infer. Only annotate if inference fails or a contract must be enforced.
- **Call a composable at setup, never inside a callback.** A composable invoked from a `watch` handler, an event handler or a `.then` runs outside the component's effect scope, so its `tryOnScopeDispose` cleanup never registers — the timer, listener or observer outlives unmount and fires into a destroyed component, and a fresh one leaks on every invocation. Instantiate once at setup with the composable's own defer option (`useTimeoutFn(fn, ms, { immediate: false })`) and call the returned `start`/`resume` from the callback.

## MaybeRefOrGetter vs Function Argument

Use `MaybeRefOrGetter<T>` when the composable **internally reacts** to the value (reads it inside a `computed`/`watch`) — it must observe changes between calls. Unwrap with `toValue()`, suffixing the unwrapped value with `Value` (`const limitValue = toValue(limit)`). Callers pass a getter to stay reactive to prop changes.

Use a plain **function argument** on the returned function when the value is a **pass-through** evaluated at call time, with no internal reactive dependency. An optional extra argument covers the edit-vs-create split (a validation composable taking the entity's own current name so it validates against itself).

- A composable whose only reads happen inside an explicitly-invoked action (`refresh`, `save`) takes a plain getter or plain args — never refs it doesn't watch. Unwatched ref parameters advertise reactivity that doesn't exist, and the caller ends up re-adding its own watch anyway.
- Vue auto-unwraps computed refs in templates, so `:rules="[someRule]"` passes the function value correctly.

## Validation Rules — Pick the Right Layer

Three layers; pick by what the rule depends on.

- **Stateless / simply parameterized** → a global alias in `app/rules.config.ts`, used via `useVRules()` (see the `vuetify` skill).
- **Depends on reactive component state, plain Vuetify form** → a shared composable taking `MaybeRefOrGetter` (above). Extract on the 2nd copy — never duplicate an inline rule across dialogs.
- **Depends on reactive state, but the form is a Vjsf schema** → a custom **Ajv keyword**, not a composable: a rule can't live in the schema as a closure, so the schema _declares_ the keyword and the component _injects_ the validate function at runtime (`references/form-dialogs.md`).

## Extract Duplicate Mutation Blocks — Builder Arg for Discriminated-Union Inputs

The same mutation block (lookup + guard + `withFinalizerAsync` + `$trpc.x.mutate`) copy-pasted across siblings differing only in payload → extract a composable that owns the store/`$trpc`/finalizer setup.

When the input is a **discriminated union**, don't type the param `Except<Input, "field">` and spread `{ ...input, field }` — that won't narrow back to the union (TS error, tempts `as`). Take a **builder** `(field) => Input` so each caller builds a complete union member and the literal is checked against the union per call site.

## Settings Tab Permissions — Hide at the Tab Level

Permission-gated settings tabs are hidden via a tab-definition map (`FooPermissionMap` in `services/<domain>/settings/`), which maps each tab type to the permission it requires; the nav component filters visible tabs through `hasPermission` in a `computed`. Individual tab components **never** check permissions — they just fetch and render, because the tab simply isn't shown to users lacking it. **Do NOT** render "Insufficient permissions" text; hide the tab entirely.

## Unwrapping Reactive Proxies

- Always `toRawDeep` from `@esposter/shared`, never Vue's `toRaw` — `toRaw` only unwraps one level. Critical when passing reactive data to APIs requiring plain objects (IndexedDB `store.put()`, `structuredClone`, `postMessage`).
- **Only clone what came out of reactive state.** `structuredClone(toRawDeep(...))` is for data pulled from stores/refs; a freshly constructed class instance is already plain and non-reactive — pass it straight through (`push(new CreateFooCommand(...))`).

## Resource Management

- Always clean up in `onUnmounted`: intervals, timeouts, animation frames, event listeners.
- Prefer `VueUse` composables over manual event listeners where possible.
- **Unmount is the teardown trigger, not "currently unneeded".** An observer or listener set up once at setup stays for the component's life; don't add a `watchEffect` that stops and re-creates it as some flag flips. An `IntersectionObserver` is the clearest case — on a `display: none` element it reports not-intersecting and goes quiet on its own, so `v-show` plus a permanent observer already costs nothing, while the stop/restart version adds a re-observation race for no saving (`Styled/Waypoint.vue`, and the `pagination` skill). Where a resource genuinely must not exist yet, use the composable's own defer option rather than a teardown cycle.

## Online/Offline Detection

- **Always `useOnline()` from VueUse** — never `navigator.onLine` directly, nor a `getIsServer()` + `navigator.onLine` guard. It returns a reactive `Ref<boolean>` updated on `online`/`offline` events and is SSR-safe (defaults to `true` on the server).
- For subscribables (tRPC subscriptions, WebSocket connections) use `useOnlineSubscribable` (`composables/shared/`), which combines `useOnline()` + `onMounted` + `watchImmediate` + `onUnmounted` cleanup.

## Browser-Only Composables (SSR Safety)

Regular `watch`/`watchDeep` are SSR-safe — they don't fire until the source changes (client-side only). Set them up directly in `setup()`, **not** inside `onMounted`: Vue scopes them to the component and disposes them on unmount, so no manual `WatchHandle[]` + `onUnmounted` cleanup.

**`watchImmediate` is the SSR concern** — it runs the callback during `setup()` (on the server). If the callback touches browser APIs, use `watchTriggerable` + `onMounted` to defer the first execution (as `useOnlineSubscribable` does):

```ts
const { trigger } = watchTriggerable(source, (value) => {
  // Browser-only logic
});
onMounted(async () => {
  await trigger();
});
```

## Least API Calls — Dirty-Check Saves (`useSave`)

Every API call must be necessary. **Never fire a persistence call (tRPC mutation or localStorage write) when the payload equals what was last persisted.** Two silent offenders this kills: a `watch` on saveable state firing when the load assigns the just-loaded value (save-on-mount), and an interval that saves every tick even when nothing changed.

The dirty check is built into `useSave` (`composables/shared/useSave.ts`) — **never hand-roll a snapshot or a `set*` wrapper in a store.** It returns `{ save, setState }`; loads go through `setState` (renamed per domain, `setFoo`/`setBar`) so the snapshot resets, and read composables never assign the state ref directly. Options, snapshot semantics and worked wiring: `references/async-sequencing.md`.

## Async Sequencing — One Primitive (hand-rolling BANNED)

A composable never decides **how** concurrency is handled. It declares **what the operation targets** (`key`) and **whether it reads or writes** (which entry point it calls) — `useMutation` (`composables/shared/useMutation.ts`) derives the rest.

**No call site chains promises, holds a map of in-flight promises, or tracks a generation counter, a call id or an `isSaving` flag to order its own async work.** An ordering worth having belongs in the primitive, keyed by target — protection applied by hand is protection that gets forgotten, and every surface that forgot it was silently losing writes or serving stale reads. A composable that seems to need its own ordering needs the right `key`.

- **`executeQuery(query, { key, onError, onSuccess })`** — reads, latest-wins per key. A superseded read is silent (no callbacks, no alert): discarding it loses nothing, which is why it is the read default.
- **`executeMutation(mutate, { applyOptimistic, key, onError, onSuccess })`** — writes, **queued** per key. Discarding a write loses its error and its rollback, so a write is never dropped by default.
- **`useQuery(query, { onSuccess })`** — `executeQuery` + `shallowRef` data + auto-fetch on setup + error alert. Reach for it before writing a bespoke read composable; write a custom one only when the state shape genuinely differs (its own cursor, an inline error panel), and build it on `executeQuery` even then.
- **Neither entry point is tRPC-only** — both take a plain `() => Promise<T>`, so IndexedDB writes and other local async work order through the same keys.
- The `isExclusive` / `isSupersede` opt-ins, the pending flag, `getSynchronizedFunction` pairing and mid-flight `checkIsStale` are in `references/async-sequencing.md`. Full model: `packages/app/content/docs/architecture/async-operations.md`.

## Routing

Route reads, route-synced tabs (`useEnumRouteQuery`), and `definePageMeta` `validate`/`key` for optional segments live in the **routing** skill.
