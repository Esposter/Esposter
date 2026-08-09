# When (not) to use `watch`

Read before writing any `watch`, or when a local `ref` mirrors a prop/store value.

Reach for `watch` only after exhausting cases 1–4. Cases 5 and 6 are the legitimate uses.

## 1. Read-only derived value → `computed`

```typescript
const displayName = computed(() => user.value?.name ?? "");
```

A local value entirely derived from — and written back to — a store value is a **writable** `computed` (`get`/`set`), never a `ref` + `watch` pair.

## 2. Form state initialized from props/store → initialize the `ref` directly

Local form state that starts from a prop/store value but is independently editable initializes the `ref` directly. **Never use `watchImmediate` just to set an initial value** — always a code smell.

```typescript
const selectedBarId = ref(foo.value?.barId ?? "");
```

If the source can change **under** the form — another client editing the same row, a subscription delivering it — the local copy must **resync**. Use VueUse's `useCloned` — never a hand-written `ref` + `watch` mirror:

```typescript
// useCloned owns the editable copy and resyncs automatically
const { cloned: selectedBarId } = useCloned(() => foo.value?.barId ?? "");
```

`useCloned(source, options)` returns `{ cloned, isModified, sync }`:

- `cloned` is a **writable** ref (bind it with `v-model`); it re-clones whenever `source` changes, so a rollback or external edit flows back into the form.
- Fold any normalization into the **source getter** (`() => x ?? ""`) rather than a custom clone.
- Default clone is `JSON.parse(JSON.stringify(...))` — fine for primitives/plain objects. For values JSON can't round-trip (Dates, class instances, reactive proxies), pass a `clone` and `deep: true`, and use the returned `sync` as the reset handler instead of a separate `resetForm`:

  ```typescript
  const { cloned: editedRow, sync: resetForm } = useCloned(() => row, {
    clone: (source) => structuredClone(toRawDeep(source)),
    deep: true,
  });
  ```

`useCloned` also covers a writable local copy driven by an imperative consumer (a `v-model` an external widget mutates) that must still resync from a reactive source — `const { cloned: darkMode } = useCloned(isDark)` bound to `v-model:dark-mode`.

A rollback of this surface's **own** rejected write is not that case, however much it looks like one: the source moves, but it moves back to a value this form already knows it tried to leave. Section 3 decides that one, and its answer is not always "resync".

Where the initialising value comes from — a prop from an adjacent parent vs a store read in the leaf — is a decomposition question owned by the `vue-component-patterns` skill.

## 3. A draft of a row the same surface writes → who owns the field decides

Never `watch` an open boolean to reset a draft — `useCloned` re-clones whenever the row moves, open or not. The real question is what the draft does when a save is **rejected**: the optimistic write unwinds the row, and the two shapes below are indistinguishable in code until one of them says which it is.

- **The surface stays open and shows the draft as unsaved** — a settings panel whose controls are still there beside the alert, guarded by an `isDirty` computed. The **form** owns the draft: `ref(source)`, no resync, so the refused value stays on screen and the next save retries it instead of the user silently losing what they entered. This is the one place the § 2 rule is deliberately inverted, and the inversion costs something real: an external edit landing mid-draft does not reach the form either, because no watcher distinguishes it from the rollback. That trade is the right way round — a value the user typed and has not yet saved outranks one they have not seen — but it means the form is stale from that moment, so the surface owes them a save that fails loudly on a stale version rather than silently overwriting. Comment it, because the next reader will otherwise "fix" it into the bug below.
- **The surface closes on submit** — a menu or dialog. The **row** owns the value: `useCloned` so the rollback flows back into the draft, plus an explicit `sync()` when the write fails. A first write that is refused leaves no row to roll back and so never moves the clone's source, which is the one case following the row cannot cover:

  ```typescript
  const { cloned: editedFoo, sync: syncEditedFoo } = useCloned(() => ({ bar: getBar(id.value) }));
  const { status } = await executeMutation(/* … */);
  if (status === MutationStatus.Failed) syncEditedFoo();
  ```

  Without it the surface reopens showing a value the server refused, beside a readout of the row that never took it.

A draft cloned as one object over every field the write sends doubles as the write's input, so the submitted payload and the resynced draft cannot drift apart.

## 4. Async read of a source the instance can't outlive → `onMounted`, not `watch`

Before watching an id to re-read on change, ask: **can it actually change under this instance?** When the router or the parent already keys the component by that id, a change unmounts and remounts it — the watch's re-run branch is dead code, and any staleness guard defends a transition that cannot happen.

Entity pages are keyed by id (``definePageMeta({ key: (route) => `foo-${route.params.id}` })``), and `BladeOutlet` keys each blade by `` `${foo.id}-${activeBlade}` `` inside `<Suspense>`. So inside a page, an Overview or a blade, the entity id is **fixed for the instance's lifetime** — read it once in `onMounted`, not `watchImmediate(() => foo.id, ...)`:

```typescript
const count = ref<number>();
onMounted(async () => {
  count.value = await getResultAsync(() => readFooCount({ id: foo.id })).unwrapOr(undefined);
});
```

A blade sits inside `<Suspense>`, so it can go further and `await` the read at setup — the fallback renders the skeleton, replacing a local `isLoading` ref:

```typescript
const id = route.params.id as string; // keyed by id upstream, so a plain cast is safe
await refreshFoos(); // Suspense shows StyledSkeleton until this resolves
```

Keep the read in a named function when a mutation must re-run it (a delete dialog's `@delete`), and call that same function at setup.

**A watch is only right here when the source genuinely varies under a live instance** — a reactive reference bound to a form control, e.g. `useFoo(() => modelValue.value?.bar)` in a picker. Then the concurrency guard earns its place, because two reads really can overlap.

## 5. Bridging to external imperative APIs → `watch` is correct

Vue reactivity can't reach Phaser, Three.js, Tiptap, Desmos, or DOM-imperative APIs:

```typescript
watch(isDark, (newIsDark) => {
  calculator.updateSettings({ invertedColors: newIsDark });
});
```

## 6. Async side effects triggered by reactive state → `watch` is correct

Auto-save, API calls on throttled search, typing indicators — the source genuinely changes under a live instance (check case 4 before reaching for this):

```typescript
watch(throttledSearchQuery, async (newQuery) => {
  const results = await search(newQuery);
  initializePaginationData(results);
});
```
