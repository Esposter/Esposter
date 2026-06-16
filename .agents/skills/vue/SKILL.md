---
name: vue
description: Esposter Vue 3 SFC conventions — macro ordering, template patterns, watch aliases, props naming, refs/computed, and conditional logic. Apply when writing .vue files.
---

# Vue Conventions

## SFC Structure & Formatting

- `<script setup lang="ts">` at the top of every SFC. Prefer attributify over `<style>` blocks; when a block is genuinely needed use `<style scoped>` and only add `lang="scss"` for Sass features (nesting, `&`, `//` comments, `@mixin`/`@include`). See the `styling` skill.
- Self-closing tags for empty components/elements: `<Component />`.
- Blank-line placement (templates, consts, returns, blocks) and comment attachment — see the `formatting` skill.

## Vue Macro Ordering

`defineSlots` → `defineModel` → `defineProps` → `defineEmits`, then all `const` assignments, then `defineExpose` last (preceded by a blank line, before any `watch`/lifecycle hooks).

- **`defineModel`**: always type explicitly. For booleans pass `{ default: false }` so the type excludes `undefined`: `defineModel<boolean>({ default: false })`. Never declare `defineModel` unless the value is used in script (`watch`, `computed`, or passed) — otherwise use `:prop` + `@event`. For an **unnamed** model, name the variable `modelValue` (never `model` or another alias): `const modelValue = defineModel<string>()`. For a **named** model, the variable matches the name: `const title = defineModel<string>("title")`.
- **`defineSlots`**: only assign to `const slots` when `slots` is referenced in script. Otherwise call `defineSlots<...>()` without assignment.

## Script Setup Declaration Order

After the macros, declare composables and state in this order:

1. **Macros** — `defineSlots` → `defineModel` → `defineProps` → `defineEmits` (see above).
2. **Framework / third-party composables** — `useNuxtApp`, `useRoute`, `useRouter`, VueUse (`useVDisplay`, `useTemplateRef`, `useDebounceFn`, …), auth (`authClient.useSession`). Group these together immediately after the macros.
3. **Custom Pinia stores** — `useXStore` + `storeToRefs` + destructured methods, using per-store grouping (init → `storeToRefs` → methods, then the next store; never batch all inits then all refs).
4. **Custom composables, refs, computeds, watches, functions** — everything else (`useRoomName`, `ref`, `computed`, `watch`, handlers).

```ts
// CORRECT
const { $trpc } = useNuxtApp();        // 2. third-party
const { smAndDown } = useVDisplay();   // 2. third-party
const roomStore = useRoomStore();      // 3. custom store
const { currentRoom } = storeToRefs(roomStore);
const roomName = useRoomName(...);     // 4. custom composable / state
```

Never leave a third-party composable (e.g. `useVDisplay`) stranded at the bottom below custom stores and refs.

## Inline Functions & Handlers

- Inline arrow functions where argument types are inferable — don't extract single-use, trivially-typed lambdas.
- Inline Vue event handlers directly in the template (`@submit="async (_, onComplete) => { ... }"`) so Vue infers event arg types. Extract to a named function only if the same logic is reused in multiple places. Single-use handlers must always be inlined.
- **`@click` shorthand**: a single async call uses `@click="myAsyncFn(args)"` directly — no `async () => { await ... }` wrapper.
- **IME composition guard** — on `@keydown.enter` for text inputs, guard inline so confirming a CJK candidate doesn't commit: `@keydown.enter.stop="!$event.isComposing && commitEdit()"`.
- **Never destructure event parameters** — use `(event: KeyboardEvent) => { event.key ... }` not `({ key })`. Destructuring event methods (`preventDefault`, etc.) causes "Illegal invocation" via lost `this` binding. Keep the full `event` object even when only reading properties.

## v-model vs Split Bindings

Prefer `v-model="ref"` over the split `:model-value` + `@update:model-value` whenever the update is a direct assignment to a single ref.

```vue
<!-- WRONG — unnecessary split for a direct assignment -->
<v-text-field :model-value="name" @update:model-value="name = $event" />

<!-- CORRECT -->
<v-text-field v-model="name" />
```

Keep the split form only when genuinely needed:

- **Computed get** — `:model-value` derives from more than a bare ref (e.g. `a?.b ?? c`)
- **Multiple writes on update** — the handler sets more than one ref
- **Extra-arg function call** — `@update:model-value="setFilter(key, $event)"`
- **Dynamic property assignment** — `@update:model-value="row[col] = $event"`
- **Genuine value transformation** — unit/date-format conversion, bitwise ops (stored value differs structurally from displayed)

### `normalizeString` Never in Vue

Never apply `normalizeString` (or any trimming) anywhere in Vue — not in `@update:model-value`, not in submit handlers. The Zod input schemas for tRPC mutations already normalize via `createNameSchema`/`createNormalizedStringSchema` (`.transform(normalizeString).pipe(...)`). Duplicating is redundant, and in `@update:model-value` actively harmful (trims mid-typing, swallows spaces).

```vue
<!-- WRONG — trims while still typing -->
<v-text-field :model-value="name" @update:model-value="name = normalizeString($event)" />

<!-- CORRECT — raw input flows through; Zod handles normalization -->
<v-text-field v-model="name" />
<!-- emit('submit', name) -->
```

To check validity or guard a disabled button, use the Zod schema's `safeParse` instead:

```vue
<!-- WRONG -->
<v-btn :disabled="!normalizeString(name)" />
<!-- CORRECT -->
<v-btn :disabled="!nameSchema.safeParse(name).success" />
```

For dirty-state comparisons, parse both sides through the schema so normalized values are compared:

```typescript
// WRONG — compares raw input against stored normalized value
normalizeString(editedTopic) !== storedTopic;
// CORRECT — parse through the schema, then compare
topicSchema.safeParse(editedTopic).data !== storedTopic;
```

`normalizeString` remains valid in non-Vue, non-form contexts (text-parsing utilities, CSV/XLSX deserialization, slash-command parsing) — anything not crossing a tRPC Zod boundary.

Don't add client-side Zod validation guards in submit/mutation handlers (no `safeParse` guards, emptiness checks, or local normalization before mutating local state). Pass raw values; trust the server schema.

```typescript
// WRONG — second-guessing the server schema
const createWord = () => {
  const word = wordSchema.safeParse(newWord.value).data;
  if (!word || list.value.includes(word)) return;
  list.value = [...list.value, word];
};

// CORRECT — pass raw, let server Zod handle it
const createWord = () => {
  list.value = [...list.value, newWord.value];
  newWord.value = "";
};
```

The only acceptable client-side validation is Vuetify form field rules (inline errors) and disabled-button state driven by `safeParse().success` on a shared schema.

## Template Attribute Ordering

1. **`v-model`** (or **`v-for`** + **`:key`**) — binding/iteration directives first
2. **`class`** — static class string
3. **UnoCSS attributify props** — shorthand utilities as props (`ma-2`, `flex`, `flex-col`)
4. **Component props with values** — `:prop="value"` / `prop="string"` (alphabetical)
5. **Shorthand boolean props** — bare names defaulting to `true` (`clearable`, `hide-details`)
6. **Event handlers** — `@event="..."` last

```vue
<v-text-field
  v-model="search"
  ma-2
  density="compact"
  label="Search"
  variant="outlined"
  clearable
  hide-details
  @keydown.enter.stop="submit()"
/>
```

## Template Conventions

- **Truthiness** — use `v-if="value"` not `v-if="value !== null"`. Explicit null/undefined comparisons only when distinguishing falsy values (`0` valid, `false` meaningful, or `null` vs `undefined` matter).
- **No bare function references in `@event` bindings** — bare refs forward the event object as first arg (almost always unintended). Use `fn()` for zero-arg calls, an arrow function when args are needed:

  ```vue
  <!-- CORRECT -->
  @click="onSave()" @complete="(scene, tilemap) => useCreateTilemapAssets(scene, tilemap)"
  <!-- WRONG — forwards Event object -->
  @click="onSave"
  ```

- **`v-for` destructuring** — destructure when properties are accessed: `v-for="{ value, icon, title } of items"` not `item.value`. Keep a full reference only when the whole object is needed (passed as prop or stored); name the loop var to match the target prop for `:propName` shorthand.
- **`#activator` always first** — in `v-tooltip`/`v-menu` etc., place `#activator` as the first child.
- **Dotted slot names need dynamic binding** — Vue rejects dots in static slot names; Vuetify item slots use brackets: `#[`item.drag`]`, `#[`item.actions`]`. Only dot-free names are static (`#top`, `#activator`).
- **Always use `:` shorthand** — `:disabled="..."` not `v-bind:disabled`. Object spread: `:="object"` not `v-bind="object"`.
- **Never use `.value` in templates** — Vue auto-unwraps refs. `ref.value` in a template reads `.value` on the unwrapped object (usually `undefined`). Write `fn(ref)`. `.value` is only for `<script setup>` outside template expressions.

## Optional Refs — Omit the Initial Value

When a ref is initially `undefined`, omit the argument — `ref<T>()` infers `Ref<T | undefined>`:

```typescript
// WRONG — explicit undefined is redundant
const callRoomId = ref<string | undefined>(undefined);
// CORRECT
const callRoomId = ref<string>();
```

## defineProps — Named `interface <ComponentName>Props`

Declare a named interface suffixed `Props`, named after the component, then pass to `defineProps<...>()`. Never use an inline object-literal type or a plain `interface Props`.

```ts
// CORRECT
interface KnockerItemProps {
  knocker: CallParticipant;
}
const props = defineProps<KnockerItemProps>();

// WRONG — anonymous type
const props = defineProps<{ knocker: CallParticipant }>();
// WRONG — generic name loses component identity
interface Props {
  knocker: CallParticipant;
}
```

Name after the component's identity (file/folder name, stripping `Index`): `PreJoin/Index.vue` → `PreJoinProps`; `JoinNotice/KnockerItem.vue` → `KnockerItemProps`.

**Prop shorthand naming** — when binding a simple local `ref`/`computed` directly to a prop, name it to match that prop so the `:prop` shorthand works: `const dataSourceType = ref(...)` → `:dataSourceType`. Doesn't apply to complex expressions (`:src="session.user.image"`) or named `defineModel` variables.

## Refs & Computed

- **Template refs** — always use `useTemplateRef`. Prefer no generic (Vue 3.5+ infers from the template). Never add a `Ref` suffix. Use a semantic name matching the `ref="..."` value (`"video"`, never `"videoRef"`). If a component type was imported only for the generic, remove that import.

  ```ts
  // CORRECT — no generic, no "Ref" suffix
  const video = useTemplateRef("video");
  // Usually WRONG — redundant generic when inference works
  const video = useTemplateRef<HTMLVideoElement>("video");
  ```

  **Generic is justified only when template inference doesn't give the type you need**: (1) the element/component the `ref` sits on doesn't expose the property you actually want, or (2) the inferred type is an overly complex union you want to simplify.

- **Sort at display time** — apply `.toSorted()` in the `computed` that feeds the template; never sort in store ingestion (`readX`, `setX`, mutation helpers). Stores hold natural order; components transform for display. **Exception**: sort before the API call when sorted order is sent to the backend (e.g. message pagination cursors).
- **Computed for reused expressions** — extract a `computed` (named to match the prop) when the same derived value binds to 2+ props; enables `:propName` shorthand. Single-use values stay inline.
- **Inline prop values** — inline directly to leverage Vue inference; extract to `computed` only when reused.
- **Map lookups over computed** — when a value depends on an enum/discriminant key, use `Map[type]` directly in the template (`Map[type].value` for multiple properties). Fall back to computed only when the lookup is duplicated 2+ places.
- **Writable computed over watch + local ref** — when a local boolean ref is entirely derived from and writes back to a store value, replace the `ref` + `watch` with a writable `computed`:

  ```typescript
  // WRONG — local ref + watch as indirect trigger
  const isUpdateMode = ref(false);
  watch(editingRowKey, (newEditingRowKey) => {
    if (newEditingRowKey !== message.rowKey) return;
    isUpdateMode.value = true;
    editingRowKey.value = undefined;
  });

  // CORRECT — writable computed; no watch
  const isUpdateMode = computed({
    get: () => editingRowKey.value === message.rowKey,
    set: (value) => {
      editingRowKey.value = value ? message.rowKey : undefined;
    },
  });
  ```

## Conditional Logic

Branch on a type/discriminant in priority order:

1. **Map lookup** — `Map[type]` inline in template (preferred)
2. **`switch` expression** — in script when a map is impractical
3. **`if / else if / else`** — explicit branches for complex conditions
4. **Never** chain standalone `if` statements for mutually exclusive conditions — use `else if`/`else` or `switch`.

## Auth Session

Always pass `useFetch` to `authClient.useSession()` so better-auth uses Nuxt's SSR-aware `useFetch`:

```ts
// CORRECT — SSR-aware
const { data: session } = await authClient.useSession(useFetch);
// WRONG — breaks SSR
const { data: session } = await authClient.useSession();
```

## Upsert Forms — Create vs Edit Mode

When a form handles both create and edit, use an explicit `isCreate` prop (default `false`) rather than deriving mode from `initialValues`. The parent passes `is-create` explicitly. Use a single `values` ref over per-field refs:

```ts
interface PostUpsertFormProps {
  initialValues?: Pick<Post, "description" | "title">;
  isCreate?: boolean;
}
const { initialValues = { description: "", title: "" }, isCreate = false } = defineProps<PostUpsertFormProps>();
const values = ref(initialValues);
```

- Template binds to `values.title` etc. (auto-unwrapped); emit passes `values` directly.
- `isCreate` drives button text: `isCreate ? 'Post' : 'Edit Post'`.
- Create page passes `is-create`; update page passes `:initial-values` (no `is-create`).

The same `isCreate?: boolean` pattern applies to dialog buttons (e.g. `CrudView/EditDialogButton`), where it also skips the equality check that would disable the save button when state matches the original.

## Watch Decision Tree — When (Not) to Use `watch`

Reach for `watch` only after exhausting these:

### 1. Read-only derived value → `computed`

```typescript
// WRONG — watch + local ref for read-only derivation
const displayName = ref("");
watchImmediate(
  () => user.value?.name,
  (name) => {
    displayName.value = name ?? "";
  },
);
// CORRECT
const displayName = computed(() => user.value?.name ?? "");
```

### 2. Form state initialized from props/store → initialize the `ref` directly

Local form state starting from a prop/store value but independently editable: initialize the `ref` directly. **Never use `watchImmediate` just to set an initial value** — always a code smell.

```typescript
// WRONG — watchImmediate to initialize
const selectedCategoryId = ref<null | string>(null);
watchImmediate(
  () => room.value?.categoryId,
  (categoryId) => {
    selectedCategoryId.value = categoryId ?? null;
  },
);
// CORRECT — initialize directly
const selectedCategoryId = ref(room.value?.categoryId ?? null);
```

If the source can change externally while the form is open (e.g. real-time collaboration), add a plain `watch` — not `watchImmediate`:

```typescript
const selectedCategoryId = ref(room.value?.categoryId ?? null);
watch(
  () => room.value?.categoryId,
  (categoryId) => {
    selectedCategoryId.value = categoryId ?? null;
  },
);
```

**Prefer props-down when the parent is adjacent and already has the data.** Child initializes from the prop — no watch, no store duplication:

```typescript
// Parent: :category-id="room?.categoryId ?? null"
const { categoryId } = defineProps<Props>();
const selectedCategoryId = ref(categoryId);
```

Only pass through an intermediate generic router component (e.g. `Content.vue`) if the prop is truly shared by all children. If only one settings type needs it, keep the store read in the leaf and initialize the ref directly.

### 3. Reset form state on dialog/menu open → only if data changes externally

Ask: **can the underlying data change between opens from an external source** (WebSocket, another tab/user)?

- **Yes** → `watch` the open boolean and reset on open
- **No** → initialize the `ref` once at setup; the watch is ceremony

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

### 4. Bridging to external imperative APIs → `watch` is correct

Vue reactivity can't reach Phaser, Three.js, Tiptap, Desmos, or DOM-imperative APIs:

```typescript
watch(isDark, (newIsDark) => {
  calculator.updateSettings({ invertedColors: newIsDark });
});
```

### 5. Async side effects triggered by reactive state → `watch` is correct

Auto-save, API calls on throttled search, typing indicators:

```typescript
watch(throttledSearchQuery, async (newQuery) => {
  const results = await search(newQuery);
  initializePaginationData(results);
});
```

### Summary

| Scenario                       | Pattern                                                   |
| ------------------------------ | --------------------------------------------------------- |
| Read-only derivation           | `computed`                                                |
| Form init from prop/store      | `ref(source.value)` directly — never `watchImmediate`     |
| Form reset on dialog/menu open | `watch(dialog, (isOpen) => { if (!isOpen) return; ... })` |
| Two-way store binding          | Writable `computed` (get/set)                             |
| External imperative API        | `watch`                                                   |
| Async side effect              | `watch`                                                   |

## Watch Aliases & `watchEffect`

- Prefer `watchDeep(source, cb)` over `watch(source, cb, { deep: true })` and `watchImmediate(source, cb)` over `{ immediate: true }`. When both needed: `watchDeep(source, cb, { immediate: true })` (alphabetical: deep before immediate).
- Always use `watch` with explicit dependencies instead of `watchEffect` — implicit tracking is hard to audit and re-runs on unrelated changes. Wrap a prop dependency in a getter: `() => isActive`.

  ```typescript
  // WRONG — implicit tracking
  watchEffect(() => {
    if (!gem.value) return;
    gem.value.material.roughnessMap = roughnessMap.value;
  });
  // CORRECT — explicit dependencies
  watch([gem, roughnessMap], ([newGem, newRoughnessMap]) => {
    if (!newGem) return;
    newGem.material.roughnessMap = newRoughnessMap;
  });
  ```

## Vue Hooks

- Place `watch`, `onMounted`, `onUnmounted`, and other lifecycle hooks/watchers at the **bottom** of `<script setup>`, after all `const` assignments, with a blank line before them.
- Always wrap the callback in an explicit arrow function — never pass a function reference directly (avoids scope/binding issues and argument forwarding): `onUnmounted(() => { reset(); })` not `onUnmounted(reset)`.
- Applies everywhere — `.map()`, `.filter()`, lifecycle hooks, JS event listeners: `array.map((item) => fn(item))` not `array.map(fn)`. (Template `@event` bindings: use `@click="fn()"`, not `@click="fn"` — see Template Conventions.)

## Browser Globals — Always Use `window.` Prefix

Prefix browser-only globals with `window.` to make browser-only code explicit (won't run on server):

```typescript
// WRONG
document.getElementById(id);
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const pc = new RTCPeerConnection({ iceServers });
const frame = requestAnimationFrame(cb);

// CORRECT
window.document.getElementById(id);
const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
const pc = new window.RTCPeerConnection({ iceServers });
const frame = window.requestAnimationFrame(cb);
```

Standard built-ins available in all environments (`Uint8Array`, `Map`, `Set`, `JSON`, `Promise`, `crypto`, etc.) do **not** need `window.`.

## SSR Guards — Always Use `getIsServer()`

Use `getIsServer()` from `@esposter/shared` to guard browser-only code. Never `import.meta.client` or `typeof window !== "undefined"` — `getIsServer()` is consistent across Nuxt, shared packages, and Azure Functions.

```typescript
// WRONG
if (import.meta.client) { ... }
// CORRECT
if (!getIsServer()) { ... }

useScript<typeof Desmos>(API_URL, {
  use: () => (getIsServer() ? undefined : window.Desmos) as typeof Desmos,
});
```

## Routing

- **`useRouter()` for reactive contexts** — reading route data inside a `computed`/`watch` (e.g. `router.currentRoute.value.params.id`) or calling navigation methods (`router.push`, `router.replace`).
- **`useRoute()` for plain reads** — reading params/query outside a reactive context (regular function or async handler).

> This inverts the usual Vue Router split deliberately: `useRoute()` returns a stale, non-reactive snapshot when called outside a component setup (composables, stores, middleware, async handlers), whereas `useRouter().currentRoute` stays reactive everywhere. Standardizing on `useRouter()` for reactive reads avoids that footgun since route reads often live in composables.

## After Finishing Code Changes

1. Run `pnpm format` from the **repo root** — formats all packages (~1.6s, oxfmt).
2. Run `pnpm typecheck` in `packages/app` as a background task — too long to block on; user reviews when ready.

## Vuetify

See the **vuetify** skill for all Vuetify-specific conventions.
