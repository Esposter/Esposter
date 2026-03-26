---
name: vue-composable-patterns
description: Esposter-specific Vue 3 composable and form patterns — MaybeRefOrGetter, SSR safety, online/offline, type-driven state reset, and resource management. Apply when writing composables, form dialogs, or browser-aware reactive code.
---

# Vue Composable & Form Patterns (Esposter)

Patterns learned through development of the Esposter project. Apply these whenever writing Vue composables, validation rules, or form dialogs.

## When to Use `MaybeRefOrGetter` vs Function Argument

Use `MaybeRefOrGetter<T>` when the composable **internally reacts** to the value — i.e., it's used inside a `computed` or `watch`. The composable needs to observe changes between calls.

Use a plain **function argument** on the returned function when the value is just a **pass-through** evaluated at call time. The composable has no internal reactive dependency on it.

```typescript
// CORRECT: MaybeRefOrGetter — composable computes based on the value
export const useColumnNameRule = (columns: MaybeRefOrGetter<DataSource['columns']>) =>
  computed(() => {
    const columnsValue = toValue(columns) // reactive, re-evaluates on change
    return (value: string) => columnsValue.some(...) ? 'exists' : true
  })

// CORRECT: plain argument — value is just passed through at call time
export const useCopyToClipboard = () => {
  return async (rowIds?: string[]) => { // rowIds evaluated at click time
    await copyToClipboard(dataSource, item, rowIds)
  }
}
```

## MaybeRefOrGetter Composables

When a composable argument should work with a plain value, a `ref`, or a getter function, type it as `MaybeRefOrGetter<T>` and unwrap with `toValue()`.

**Naming convention:** `const {name}Value = toValue({name})` — always suffix with `Value`.

```typescript
// composables/tableEditor/file/useColumnNameRule.ts
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

export const useColumnNameRule = (columns: MaybeRefOrGetter<DataSource["columns"]>, currentName?: string) =>
  computed(() => {
    const columnsValue = toValue(columns);
    return (value: string): string | true => {
      if (value !== currentName && columnsValue.some(({ name }) => name === value)) return "Column already exists";
      return true;
    };
  });
```

**Callers pass a getter to stay reactive to prop changes:**

```typescript
const uniqueNameRule = useColumnNameRule(() => dataSource.columns, column.name); // edit
const uniqueNameRule = useColumnNameRule(() => dataSource.columns); // create
```

**Rules:**

- Don't explicitly annotate composable return types — let TypeScript infer. Only annotate if inference fails or a specific contract must be enforced.
- Vue auto-unwraps computed refs in templates, so `:rules="[uniqueNameRule]"` correctly passes the function value.

## Extract Duplicate Validation Rules

When the same validation rule appears in 2+ components, extract it to a shared composable immediately. Don't copy-paste. The `currentName` optional param handles the "allow own name" case for edit vs create:

```typescript
// WRONG: Duplicate inline rules in EditDialogButton and CreateDialogButton
const uniqueNameRule = (v: string) => v === column.name || !columns.some(...) || 'Column already exists'

// RIGHT: Single composable, optional exclude param covers both edit and create
const uniqueNameRule = useColumnNameRule(() => dataSource.columns, column.name) // edit
const uniqueNameRule = useColumnNameRule(() => dataSource.columns)               // create (no exclude)
```

## Schema-Controlling Selectors in `#prepend-form`

When a dialog has a selector (e.g., column type, chart type) that controls **which Vjsf schema** is rendered, put it in the `#prepend-form` slot — not in the default slot alongside the schema content.

This matches the established pattern in `Dashboard/Visual/Preview/EditFormDialog.vue`:

```vue
<!-- WRONG: type selector mixed into default slot with Vjsf -->
<TableEditorFileEditDialogButton ...>
  <v-select v-model="columnType" label="Type" ... />
  <Vjsf v-model="editedColumn" :schema="jsonSchema" />
</TableEditorFileEditDialogButton>

<!-- RIGHT: type selector in #prepend-form, schema content in default -->
<TableEditorFileEditDialogButton ...>
  <template #prepend-form>
    <v-select v-model="columnType" label="Type" ... />
  </template>
  <v-text-field v-model="editedColumn.name" label="Column" ... />
  <Vjsf v-model="editedColumn" :schema="jsonSchema" />
</TableEditorFileEditDialogButton>
```

The `TableEditorFileEditDialogButton` component exposes a `#prepend-form` slot rendered inside `v-form` before the default slot content.

## Reactive Type-Switching with `watch`

When switching a form object's type (e.g., column type change), preserve unchanged fields (like `name`) and reset type-specific fields to defaults by constructing a new class instance:

```typescript
const columnType = ref(ColumnType.String);
const editedColumn = ref<Column | DateColumn>(new Column());

watch(columnType, (newType) => {
  const name = editedColumn.value.name; // preserve name
  editedColumn.value = newType === ColumnType.Date ? new DateColumn({ name }) : new Column({ name, type: newType });
});
```

Note use of `name` (not `currentName`) to enable object shorthand `{ name }`.

## No `structuredClone` / `toRawDeep` on Freshly Newed Instances

Only call `structuredClone(toRawDeep(...))` on data pulled from Vue reactive stores or refs. Freshly constructed class instances are already plain, non-reactive objects.

````typescript
// WRONG: Unnecessary wrapping
const newRow = new Row({ data: { ... } })
executeAndRecord(new CreateRowCommand(index, structuredClone(toRawDeep(newRow))))

// RIGHT: Just pass the instance directly
const newRow = new Row({ data: { ... } })
executeAndRecord(new CreateRowCommand(index, newRow))

// CORRECT: Clone IS needed for data from reactive stores
const originalRow = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.rows, index)))

## Unwrapping Reactive Proxies

- **Always use `toRawDeep` from `@esposter/shared`** instead of Vue's `toRaw` — `toRaw` only unwraps one level, while `toRawDeep` recursively unwraps all nested reactive proxies. This is critical when passing reactive data to APIs that require plain objects (e.g. IndexedDB `store.put()`, `structuredClone`, postMessage).

## Resource Management

- Always clean up in `onUnmounted`: intervals, timeouts, animation frames, event listeners.
- Prefer `VueUse` composables over manual event listeners where possible.

## Online/Offline Detection

- **Always use `useOnline()` from VueUse** — never use `navigator.onLine` directly or `getIsServer()` + `navigator.onLine` guards
- `useOnline()` returns a reactive `Ref<boolean>` that updates on `online`/`offline` events
- SSR-safe: defaults to `true` on the server (no `navigator` access, no crash)
- For subscribables (tRPC subscriptions, WebSocket connections), use `useOnlineSubscribable` which combines `useOnline()` + `onMounted` + `watchImmediate` + `onUnmounted` cleanup into a single composable — see `composables/shared/useOnlineSubscribable.ts`

## Browser-Only Composables (SSR Safety)

Regular `watch`/`watchDeep` are SSR-safe — they don't fire until the source changes (which only happens client-side). Set them up directly in `setup()`, not inside `onMounted`. Vue automatically scopes them to the component and disposes them on unmount — no manual `WatchHandle[]` + `onUnmounted` cleanup needed.

```ts
export const useBrowserFeature = () => {
  const someStore = useSomeStore();
  const { someRef } = storeToRefs(someStore);
  const online = useOnline();

  // Safe: watchDeep/watch only fire on changes (client-side)
  watchDeep(someRef, (value) => {
    // Safe to use indexedDB, etc. here
  });

  watch(someOtherRef, async (value) => {
    if (!value || online.value) return;
    // ...
  });
};
````

**`watchImmediate` is the SSR concern** — it executes the callback during `setup()`, which runs on the server. If the callback accesses browser APIs, use `watchTriggerable` + `onMounted` to defer the first execution (see `useOnlineSubscribable`):

```ts
const { trigger } = watchTriggerable(source, (value) => {
  // Browser-only logic
});

onMounted(async () => {
  await trigger();
});
```

## Composable Rules

- **Never use `createSharedComposable`** — VueUse's `createSharedComposable` creates global singletons that bypass Pinia's devtools, HMR, and reactive reset behavior. All shared reactive state must live in a Pinia store (`defineStore`). Composables that previously used `createSharedComposable` should be either replaced by a store entirely, or made thin wrappers that delegate to the corresponding store.
- **Single-function composables return the function directly** — when a composable only exposes one function, return it directly instead of wrapping in an object: `return async (...) => { ... }`. Callers use `const fn = useX()` instead of `const { fn } = useX()`.
- **`Promise.resolve(value)` for sync-to-async** — when a sync expression needs to satisfy a `Promise<T>` return type, use `Promise.resolve(value)` instead of `async () => value`.

## Type-Driven State Reset: Watch + Create Map

When a "discriminant" ref (type selector) changes and should **reinitialize** a related mutable ref, use `watch` with a **create map** that abstracts the per-type construction logic.

**Step 1 — define a create map in services:**

```ts
// ColumnTypeCreateMap.ts
export const ColumnTypeCreateMap = {
  [ColumnType.Boolean]: { create: (name = "") => new Column<ColumnType.Boolean>({ name, type: ColumnType.Boolean }) },
  [ColumnType.Date]: { create: (name = "") => new DateColumn({ name }) },
  [ColumnType.Number]: { create: (name = "") => new Column<ColumnType.Number>({ name, type: ColumnType.Number }) },
  [ColumnType.String]: { create: (name = "") => new Column({ name }) },
} as const satisfies Record<
  Exclude<ColumnType, ColumnType.Computed>,
  { create: (name?: string) => DataSource["columns"][number] }
>;
```

**Step 2 — use watch + map in the component:**

```ts
const columnType = ref<Exclude<ColumnType, ColumnType.Computed>>(ColumnType.String);
const editedColumn = ref(structuredClone(ColumnTypeCreateMap[ColumnType.String].create()));
const resetForm = () => {
  editedColumn.value = structuredClone(ColumnTypeCreateMap[columnType.value].create());
};

watch(columnType, (newType) => {
  const name = editedColumn.value.name;
  editedColumn.value = structuredClone(ColumnTypeCreateMap[newType].create(name));
});
```

For **external sync** (when a parent can reset the model): add a second watch on the discriminant field of the model to keep the local ref in sync.

```ts
const transformationType = ref(editedColumn.value.transformation.type);
watch(transformationType, (newType) => {
  editedColumn.value.transformation = ColumnTransformationTypeCreateMap[newType].create();
});
watch(
  () => editedColumn.value.transformation.type,
  (newType) => {
    transformationType.value = newType;
  },
);
```

**Notes**:

- Always initialize the local type ref from the current model value, not a hardcoded default
- `if (newType === oldType) return;` in a watch callback is always redundant — Vue only fires when the value changes
- Writable computed is NOT the right tool here — it requires a backing `_ref` and still needs an external sync watch when a parent can reset the model

```

```
