# Sequencing overlapping reads and writes, and skipping saves that aren't dirty

Read when a composable issues a read or a write that can overlap another, or persists state that may be unchanged since the last save. The bans that make these the only options — no promise chains, no in-flight promise maps, no generation counters or `isSaving` flags, no hand-rolled dirty snapshot — are the primitive table in `SKILL.md`.

## The entry points

- **`executeQuery(query, { key, onError, onSuccess, runScope })`** — reads, ordered per key through the run scope the caller holds (`useRunScope`): a newer run of the key aborts the one before it, and only the newest run commits. An aborted read is silent (no callbacks, no alert): discarding it loses nothing, which is why it is the read default.
- **`executeMutation(mutate, { key, onError, reconcile })`** — a write the overlay does not hold, **queued** per key, returning nothing. The awaited form, `{ awaitedBecause, key, onSuccess }`, resolves to a `MutationOutcome` and is only for the reasons `apps/web/app/models/shared/AwaitedReason.ts` lists. Discarding a write loses its error, so a write is never dropped by default.
- **A write to a server row is an overlay entry** — `writeOptimistic(mutate, { entry, onError })` takes an entry and no key, and `writeAwaited(mutate, { awaitedBecause, onError })` takes an `AwaitedReason` in place of an entry (`apps/web/app/store/overlay.ts`). The entry is a pure function over the keyed view, the registry infers the rows it touches, and a failed write drops its entry. A new optimistic write takes an entry, never an `applyOptimistic` closure that restores what it replaced.
- **A row a typed event pushes goes to the overlay, not to a ref.** A store with both a cached read and a `store*` event handler hands each row to `arrive(table, row)` from `useOverlayStore`, which applies it only at a version above the one held, or fills its missing columns at the held version. A read still on its way answers at a lower version and loses there, so neither the store nor `useCachedRead` orders anything of its own.
- **`useQuery(query, { onSuccess })`** — `executeQuery` + `shallowRef` data + auto-fetch on setup + error alert. Reach for it before writing a bespoke read composable; write a custom one only when the state shape genuinely differs (its own cursor, an inline error panel), and build it on `executeQuery` even then.
- **Neither entry point is tRPC-only** — both take a plain `() => Promise<T>`, so IndexedDB writes and other local async work order through the same keys.

## The opt-ins

- **`isExclusive: true` on a read** — single-flight, for the fan-out read every instance of a surface issues on mount (the worked cases are `openspec/specs/architecture/async-operations/design.md`'s). The second caller **joins** the in-flight call and resolves with its outcome, so the data is in the store by the time it returns — a joiner is never dropped by its own choice, which would leave that caller rendering empty. It joins only what is still in flight, so read-once-per-session stays a separate cache flag (`isLoaded`, a `loadedFooIds` set) checked at the call site first, and a re-read issued _because_ something changed omits the opt-in rather than joining the answer it just invalidated.
- **`isExclusive: true` on a write** — drops a duplicate outright, because its caller wanted an effect that is already happening.

## Pending state and sync call sites

- **`isPending` / `checkIsPending(key)`** come from the same instance, so a read composable returns that `isPending` under its own name instead of keeping a ref of its own (the `naming` skill, `references/boolean-families.md`).
- **A row's own pending over writes that must share one key** — the key is the target, so rows whose writes queue on one key all read one pending flag. Each row's write is wrapped in a second instance's write keyed by the row, and `checkIsPending(rowKey)` on that instance holds for the issuing row alone, including while it waits in the shared queue (`apps/web/app/components/User/LinkedAccountsCard`). Never a per-row key on the shared write, which drops the queue the key was for.
- **A write reached from more than one call site is an entry in a store, so every call site shares the registry's queue.** No executor is passed between call sites, and a `useMutation()` made at each site is the shape this rules out.
- **`getSynchronizedFunction(fn)`** (`@esposter/shared`) fires an async fn from a sync context (a watcher callback, or a fetch kicked off during setup with no Suspense boundary). Pair it with the entry point instead of floating the promise.

## Staleness is per target

A task that must check mid-flight is run by a run scope, which hands it the run's abort signal — the guard is handed to it, never built by it.

A run is ordered **per target**, so a run of one target never aborts another's. An operation whose target itself moved on was aborted by nothing — re-check the source after the await and bail.

## `useSave` options and snapshot semantics

Two silent offenders the dirty check kills: a `watch` on saveable state firing when the load assigns the just-loaded value (save-on-mount), and an interval that saves every tick even when nothing changed. A load goes through `setState` so the snapshot resets rather than the state ref being assigned directly.

`useSave(state, options)` takes the state `Ref` plus an optional `toSave` mapper (when the persisted shape differs from the in-memory shape) and the `auth` / `unauth` sinks:

```ts
// store — persisted shape differs from in-memory shape: pass toSave
const foo = ref(new Foo());
const { save: saveFoo, setState: setFoo } = useSave(foo, {
  auth: { save: $trpc.foo.saveFoo.mutate },
  toSave: toFooSave,
  unauth: { key: LocalStorageKey.FooStore, schema: fooSaveSchema },
});

// store — persisted shape IS the state: omit toSave
const { save: saveBar, setState: setBar } = useSave(bar, { auth, unauth });

// read composable — loads go through the returned setter, never assign the state ref directly
setFoo(toFoo(await $trpc.foo.readFoo.query()));
```

- `save` skips (returning `true`) when the state's JSON snapshot equals the last persisted one — "already persisted" is success, not failure.
- `setState` assigns loaded state AND resets the snapshot in one call; the snapshot-reset bookkeeping is internal and callers never see it.
- The snapshot updates only after a **successful** save, so failures retry on the next trigger.
- Snapshots are JSON strings (`Serializable.toJSON` handles reactive proxies/class instances) with `updatedAt` excluded — the save path bumps `updatedAt`, so it must not participate in the dirty check.
- The resource store's `saveContent` runs the same skip over resource content, but its snapshot excludes **nothing**: the content is arbitrary user data, where a key named `updatedAt` can be a spreadsheet column rather than metadata, and dropping it would compare a genuine edit as unchanged. So a content store must never stamp the content before saving it — `saveItemMetadata` belongs to `useSave`, which owns the bump it excludes.
