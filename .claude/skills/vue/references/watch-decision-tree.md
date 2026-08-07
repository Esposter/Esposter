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
const selectedBarId = ref(foo.value?.barId ?? null);
```

If the source can change externally while the form is open (real-time collaboration, an optimistic store that rolls back on failure), the local copy must **resync**. Use VueUse's `useCloned` — never a hand-written `ref` + `watch` mirror:

```typescript
// useCloned owns the editable copy and resyncs automatically
const { cloned: selectedBarId } = useCloned(() => foo.value?.barId ?? null);
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

Where the initialising value comes from — a prop from an adjacent parent vs a store read in the leaf — is a decomposition question owned by the `vue-component-patterns` skill.

## 3. Reset form state on dialog/menu open → only if data changes externally

Ask: **can the underlying data change between opens from an external source** (WebSocket, another tab/user)?

- **Yes** → `watch` the open boolean and reset on open.
- **No** → initialize the `ref` once at setup; the watch is ceremony.

```typescript
// ONLY justified if status can change externally (e.g. WebSocket)
watch(menu, (isOpen) => {
  if (!isOpen) return;
  selectedStatus.value = status.value;
  statusMessage.value = message.value;
});
// If this is the only mutation path, skip the watch:
const selectedStatus = ref(status.value);
```

If the user opens → changes → closes without saving → reopens, they see their unsaved selection — usually acceptable (it indicates intent). Watch-to-reset forces a reset on every open, which can feel punishing.

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
