---
name: vue-composable-patterns
description: Apply when writing or reviewing a composable, a form dialog, browser-aware reactive code, or any state that spans an await, a tick or a mount. Esposter Vue 3 composable patterns — the table of primitives that already own a job (useMutation, useCachedRead, useSave, useWorkerInterval, usePanZoom, getOrCreate, useAdoptResourceContent, createContentData) and the ban on hand-rolling them, a hand-kept count of in-flight anything as the tell, no pass-through composables, createSharedComposable and module-scope refs banned, MaybeRefOrGetter only for what the composable watches, the three validation-rule layers, toRawDeep over toRaw, and no persistence call for an unchanged payload.
---

# Vue Composable & Form Patterns

## Settled — do not re-propose

- **A rule for a hand-kept in-flight count** — decidable only where the pair brackets one asynchronous operation, incremented where it starts and decremented where it settles; monotonicity is not the test, since a domain total moves both ways too, and whether two writes name the same operation is a question about what they mean.

## Reach for the primitive — hand-rolling BANNED

Most of what a composable is tempted to write by hand already exists here, and the hand-rolled copy is not merely
duplicated — it is the copy that drifts, forgets its teardown, or silently loses a write. **Before writing state
that spans an `await`, a tick or a mount, find the row.**

| Wanting to…                                            | Use                                                                                | Never                                                                                            |
| :----------------------------------------------------- | :--------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| order overlapping reads or writes                      | `useMutation` (`executeQuery`/`executeMutation`), keyed by target                  | a promise chain, an in-flight promise map, a generation counter, a call id, an `isSaving` flag   |
| let a pushed value beat a read already in flight       | `useCachedRead(...).supersede(key)`                                                | a pair of counters beside a `ref`                                                                |
| skip a save when nothing changed                       | `useSave` (`{ save, setState }`)                                                   | a hand-rolled snapshot, or a `set*` wrapper in a store                                           |
| know a save is still coming                            | the mutation's own `isPending`                                                     | a counter of armed debounces, or an `isPending` you assign yourself                              |
| run something on an interval for a component's life    | `useWorkerInterval`                                                                | `setInterval` in `onMounted` + `clearInterval` in `onUnmounted`                                  |
| pan and zoom a surface                                 | `usePanZoom`                                                                       | scale/offset refs and pointer handlers                                                           |
| read or insert into a `Map`                            | `getOrCreate` (`@esposter/shared`)                                                 | `let x = map.get(k); if (!x) …`                                                                  |
| let a restore reach an editor that holds the document  | `useAdoptResourceContent` (Tiptap, SurveyJS, GrapesJS)                             | a `:key` remount, or trusting the store's ref to reach a library that parsed it once             |
| load, re-read on restore and save a resource's content | `createContentData` — the base of every content store, read once per open resource | `readResource` + `readContent` hand-rolled in a store, or a blade's own `isLoading` and skeleton |

**A counter is the tell.** Every entry above was written by hand somewhere first, and each time the shape was the
same: the problem looked complex enough that bookkeeping felt earned. It is the opposite signal. A count of
in-flight or armed _anything_ is the moment to stop and name the primitive that owns it — and where a flag really
is the answer, ask what one write actually cleans before reaching for a number. Counting two of something a
single operation resolves is a bug wearing rigour.

## Deep dives

- `references/async-sequencing.md` — when a composable issues a read or a write that can overlap another, or persists state that may be unchanged since the last save.
- `references/browser-observation.md` — when a composable reads scroll position or online state, or must not run during SSR.
- `references/form-dialogs.md` — when building a dialog that edits an entity: a selector that switches which schema renders, a reset on type change, a schema form's rule that needs live component state, or the dialog's initial data load.
- `references/composable-lifecycle.md` — when a composable `await`s before registering hooks or watchers, or when wiring a feature's tRPC subscriptions.
- `references/resource-cleanup.md` — when setting up an interval, listener, observer or pan/zoom surface, or deciding when to tear one down.

## Composable Rules

- **A composable that only re-exposes something is not a composable — delete it.** `useFoo()` whose body is `storeToRefs(useFooStore())`, a single `computed` over one store ref, or a rename of one import buys nothing and costs a layer: the consumer can no longer see where the state lives, the store's own methods are invisible from the call site, and every new field has to be threaded through the wrapper. Use the store directly (`pinia` skill's ordering rules apply). A composable earns its file only when it **composes**: it owns local reactive state, sequences async work, wires a lifecycle hook, or joins two or more sources into something neither provides.
- **Minimal public surface** — return only the composed operations callers actually use; bookkeeping helpers stay internal. If every caller would pair two returned functions the same way (e.g. assign + a snapshot reset), return the composed function (`setState`) instead of the parts.
- **Never use `createSharedComposable`** (a `no-restricted-syntax` error) — VueUse's `createSharedComposable` creates global singletons that bypass Pinia devtools, HMR, and reactive reset. All shared reactive state must live in a Pinia store (`defineStore`). Existing usages should be replaced by a store, or made thin wrappers delegating to the store.
- **A bare `ref` at module scope is the same singleton without the name** (a `no-restricted-syntax` error in any `.ts` file) — a `ref` declared outside the composable's body is process-wide state every caller shares, so it carries every cost `createSharedComposable` is banned for and announces none of them. It belongs in a Pinia store. Before writing one, check whether a store already owns that surface: a module-scope notification `ref` is almost always `useAlertStore` re-implemented, and the re-implementation is how a display surface ends up mounted nowhere while its producer keeps writing to it. Module scope is for constants and `markRaw`ed class instances, never reactive state.
- **Single-function composables return the function directly** — `return async (...) => { ... }`. Callers use `const fn = useX()` not `const { fn } = useX()`.
- **`Promise.resolve(value)` for sync-to-async** — when a sync expression must satisfy a `Promise<T>` return type, never `async () => value`.
- **Don't annotate composable return types** — let TypeScript infer. Only annotate if inference fails or a contract must be enforced.
- **Call a composable at setup, never inside a callback** — outside the component's effect scope its cleanup never registers, so the timer or listener outlives unmount and a fresh one leaks per invocation (`references/resource-cleanup.md`).

## MaybeRefOrGetter vs Function Argument

Use `MaybeRefOrGetter<T>` when the composable **internally reacts** to the value (reads it inside a `computed`/`watch`) — it must observe changes between calls. Unwrap with `toValue()`, suffixing the unwrapped value with `Value` (`const limitValue = toValue(limit)`). Callers pass a getter to stay reactive to prop changes.

Use a plain **function argument** on the returned function when the value is a **pass-through** evaluated at call time, with no internal reactive dependency. An optional extra argument covers the edit-vs-create split (a validation composable taking the entity's own current name so it validates against itself).

- A composable whose only reads happen inside an explicitly-invoked action (`refresh`, `save`) takes a plain getter or plain args — never refs it doesn't watch. Unwatched ref parameters advertise reactivity that doesn't exist, and the caller ends up re-adding its own watch anyway.
- Vue auto-unwraps computed refs in templates, so `:rules="[someRule]"` passes the function value correctly.

## Validation Rules — Pick the Right Layer

A validation rule lives in one of three layers, chosen by what it depends on: a builder in the library's `UiRules`, a shared composable,
or a refinement on the form schema when the form is a schema form. Extract on the 2nd copy — never duplicate an inline
rule across dialogs. Which layer, and where a schema form's refinement is built: `references/form-dialogs.md`.

## Extract Duplicate Mutation Blocks — Builder Arg for Discriminated-Union Inputs

The same mutation block (lookup + guard + `withFinalizerAsync` + `$trpc.x.mutate`) copy-pasted across siblings differing only in payload → extract a composable that owns the store/`$trpc`/finalizer setup.

When the input is a **discriminated union**, don't type the param `Except<Input, "field">` and spread `{ ...input, field }` — that won't narrow back to the union (TS error, tempts `as`). Take a **builder** `(field) => Input` so each caller builds a complete union member and the literal is checked against the union per call site.

## Unwrapping Reactive Proxies

- Always `toRawDeep` from `@esposter/shared`, never Vue's `toRaw` — `toRaw` only unwraps one level. Critical when passing reactive data to APIs requiring plain objects (IndexedDB `store.put()`, `structuredClone`, `postMessage`).
- **Only clone what came out of reactive state.** `structuredClone(toRawDeep(...))` is for data pulled from stores/refs; a freshly constructed class instance is already plain and non-reactive — pass it straight through (`push(new CreateFooCommand(...))`).

## Resource Management

Anything that outlives a tick — an interval, a listener, an observer — is torn down at unmount and never on a
flag flipping, and the primitives above own the common cases. The rules and the reasoning:
`references/resource-cleanup.md`.

## Observing the browser — `references/browser-observation.md`

Scroll, connectivity and every other browser-only reading has one right shape here, and measuring where the platform will observe is the recurring mistake. **A composable reading scroll position or online state, or one that must not run during SSR**, is that page.

## Least API Calls — Dirty-Check Saves

Every API call must be necessary. **Never fire a persistence call — tRPC mutation or localStorage write — when the payload equals what was last persisted.** The check belongs to `useSave`, and a load goes through its `setState` so the snapshot resets; the two silent offenders (save-on-mount from a `watch`, an interval saving every tick) and the snapshot semantics are `references/async-sequencing.md`.

## Async Sequencing — One Primitive

A composable never decides **how** concurrency is handled. It declares **what the operation targets** (`key`) and **whether it reads or writes** (which entry point it calls) — `useMutation` (`composables/shared/useMutation.ts`) derives the rest. A composable that seems to need its own ordering needs the right `key`.

**A store is a call site too.** A store that both reads a value and receives it pushed — a subscription, a broadcast, any handler writing the same ref the read writes — is ordering two async sources against each other, which is the primitive's job however few lines it takes to fake.

The entry points, the `isExclusive` / `isSupersede` opt-ins, the pending flag, `getSynchronizedFunction` pairing and mid-flight `checkIsStale`: `references/async-sequencing.md`. Full model: `apps/web/content/docs/architecture/async-operations.md`.
