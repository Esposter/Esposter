# Sequencing overlapping reads and writes, and skipping saves that aren't dirty

Read when a composable issues a read or a write that can overlap another, or persists state that may be unchanged since the last save. The bans — no promise chains, no in-flight promise maps, no generation counters or `isSaving` flags, no hand-rolled dirty snapshot — and the two entry points are in `SKILL.md`.

## The opt-ins

- **`isExclusive: true` on a read** — single-flight, for the fan-out read every instance of a surface issues on mount (one room's follow state behind every follow button in it). The second caller **joins** the in-flight call and resolves with its outcome, so the data is in the store by the time it returns — a read is never `Dropped`, which would leave that caller rendering empty. It joins only what is still in flight, so read-once-per-session stays a separate cache flag (`isLoaded`, a `loadedRoomIds` set) checked at the call site first, and a re-read issued _because_ something changed omits the opt-in rather than joining the answer it just invalidated.
- **`isSupersede: true` on a write** — latest-wins, for a control that fires per keystroke or drag frame. A superseded write still rolls back and still reports its failure.
- **`isExclusive: true` on a write** — drops a duplicate outright, because its caller wanted an effect that is already happening.

## Pending state and sync call sites

- **`isPending` / `getIsPending(key)`** come from the same instance, so a read composable exposes `isPending` renamed (`isPending: isLoading`) instead of keeping its own ref.
- **`getSynchronizedFunction(fn)`** (`#shared/util/function/`) fires an async fn from a sync context (a watcher callback, or a fetch kicked off during setup with no Suspense boundary). Pair it with the entry point instead of floating the promise.

## Staleness is per target

An operation that must check mid-flight (a multi-step local media switch) receives `checkIsStale` as its callback's first argument — the guard is handed to it, never built by it.

Latest-wins is **per target**, so an operation whose target moved on entirely (the room changed while IndexedDB answered) was never superseded — re-check the source after the await and bail.

## `useSave` options and snapshot semantics

`useSave(state, options)` takes the state `Ref` plus an optional `toSave` mapper (when the persisted shape differs from the in-memory shape) and the `auth` / `unauth` sinks:

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

- `save` skips (returning `true`) when the state's JSON snapshot equals the last persisted one — "already persisted" is success, not failure.
- `setState` assigns loaded state AND resets the snapshot in one call; the `markSaved`-style bookkeeping is internal and callers never see it.
- The snapshot updates only after a **successful** save, so failures retry on the next trigger.
- Snapshots are JSON strings (`Serializable.toJSON` handles reactive proxies/class instances) with `updatedAt` excluded — `saveItemMetadata` bumps it as part of saving, so it must not participate in the dirty check.
