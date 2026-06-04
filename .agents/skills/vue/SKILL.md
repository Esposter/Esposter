---
name: vue
description: Esposter Vue 3 SFC conventions — macro ordering, template patterns, watch aliases, props naming, refs/computed, and conditional logic. Apply when writing .vue files.
---

# Vue Conventions

## SFC Structure & Formatting

- `<script setup lang="ts">` at the top of every SFC.
- Always use `lang="scss"` in Vue `<style>` blocks.
- Use self-closing tags for components/elements without content: `<Component />`.
- No blank lines within Vue templates.
- No blank lines between `const` assignments — group them tightly together.
- No blank line before `return` when it immediately follows a `const` assignment in a small function.
- **Composables that return a function directly**: no blank line between the last `const` assignment and the `return` — the `return` line immediately follows the last setup line with no gap.
- Avoid unnecessary comments — make variable names descriptive instead of explaining obvious logic. Keep comments that explain _why_ (non-obvious decisions, disable reasons, intentional workarounds). No blank line before or after a comment — attach it directly to the code it describes.
- Minimise blank lines; group related code tightly.
- **Blank line after a closing `}`** of an `if`, `for`, or other block statement — unless it is the last statement in its scope or is immediately followed by another opening block.

## Vue Macro Ordering

`defineSlots` → `defineModel` → `defineProps` → `defineEmits` (in this order), then all `const` assignments, then `defineExpose` last (preceded by a blank line, before any `watch`/lifecycle hooks).

## Inline Functions & Macros

- **Inline arrow functions** where argument types can be inferred from context — don't extract single-use, trivially-typed lambdas into named functions.
- **Inline Vue event handlers** — always write handlers directly in the template (`@submit="async (_, onComplete) => { ... }"`). This lets Vue infer event argument types automatically. Only extract to a named function if the same logic is reused in multiple places (e.g. called from both a button click AND a keydown handler). Single-use handlers must always be inlined, no exceptions.
- **IME composition guard** — when handling `@keydown.enter` on text inputs, guard inline against IME composition so that confirming a CJK candidate doesn't prematurely commit: `@keydown.enter.stop="!$event.isComposing && commitEdit()"`.
- **`defineModel`**: always type explicitly. For booleans, you must pass `{ default: false }` so the type does not implicitly include `undefined` (`defineModel<boolean>({ default: false })`).
- **`defineSlots`**: only assign to a variable when `slots` is actually referenced in script — `const slots = defineSlots<{ ... }>()`. If `slots` is not used in script (e.g. the template uses `<slot>` tags directly), call `defineSlots<...>()` without assignment.
- **Never destructure event parameters** — always use `(event: KeyboardEvent) => { event.key ... }` not `({ key }: KeyboardEvent) => { key ... }`. Destructuring event methods (e.g. `preventDefault`, `stopPropagation`) causes "Illegal invocation" because they lose their `this` binding. Keep the full `event` object for consistency even when only accessing properties.
- **`@click` shorthands** — if a click handler is a single async call, use `@click="myAsyncFn(args)"` directly — no need to wrap in `async () => { await myAsyncFn(args) }`.
- **Never declare `defineModel` unless the value is actually used** in script (e.g. in a `watch`, `computed`, or passed somewhere). Don't create a model just to forward it — use `:prop` + `@event` instead.

## v-model vs Split Bindings

Prefer `v-model="ref"` over the split `:model-value="ref"` + `@update:model-value="ref = $event"` whenever the update is a direct assignment to a single ref.

```vue
<!-- WRONG — unnecessary split for a direct assignment -->
<v-text-field :model-value="name" @update:model-value="name = $event" />

<!-- CORRECT -->
<v-text-field v-model="name" />
```

Keep the split form only when genuinely needed:

- **Computed get expression** — `:model-value` derives from more than a bare ref (e.g. `a?.b ?? c`)
- **Multiple writes on update** — the handler sets more than one ref
- **Extra-arg function call** — `@update:model-value="setFilter(key, $event)"` (v-model can't pass `key`)
- **Dynamic property assignment** — `@update:model-value="row[col] = $event"` (v-model can't target a computed key)
- **Genuine value transformation** — unit conversion, date-format conversion, bitwise ops (anything where the stored value differs structurally from the displayed value)

**Never apply `normalizeString` (or any trimming) anywhere in Vue components — not in `@update:model-value` and not in submit handlers.** The Zod input schemas for tRPC mutations already normalize string fields at the boundary via `createNameSchema`/`createNormalizedStringSchema` (which use `.overwrite(normalizeString)`). Duplicating the transform in Vue is redundant and, in `@update:model-value`, actively harmful (trims mid-typing and swallows spaces):

```vue
<!-- WRONG — trims while the user is still typing -->
<v-text-field :model-value="name" @update:model-value="name = normalizeString($event)" />

<!-- WRONG — redundant; the Zod schema already normalizes on the server -->
<v-text-field v-model="name" />
<!-- emit('submit', normalizeString(name)) ← unnecessary -->

<!-- CORRECT — raw input flows through unchanged; Zod handles normalization -->
<v-text-field v-model="name" />
<!-- emit('submit', name) -->
```

`normalizeString` must **never** appear directly in Vue components. Where you need to check validity or guard a disabled button, use the relevant Zod schema's `safeParse` instead:

```vue
<!-- WRONG — directly normalizing to check emptiness -->
<v-btn :disabled="!normalizeString(name)" />

<!-- CORRECT — let the schema decide validity -->
<v-btn :disabled="!nameSchema.safeParse(name).success" />
```

For dirty-state comparisons (e.g. enabling a Save button only when the value actually changed), parse both sides through the schema so normalized values are compared:

```typescript
// WRONG — compares raw input against stored normalized value
normalizeString(editedTopic) !== storedTopic;

// CORRECT — parse through the schema, then compare
topicSchema.safeParse(editedTopic).data !== storedTopic;
```

`normalizeString` remains valid in non-Vue, non-form contexts within the codebase (text-parsing utilities, CSV/XLSX deserialization, slash-command parsing, etc.) — places that don't go through a tRPC Zod boundary.

**Schema placement requirement**: any schema used for `safeParse` in a Vue component must live in `packages/app/shared/` (or `@esposter/db-schema` / `@esposter/shared`). If the schema is currently defined inline in a server-side tRPC router, move it to the appropriate `shared/models/db/<domain>/` file before using it client-side.

## Template Attribute Ordering

Within any element or component tag, order attributes as follows:

1. **`v-model`** (or **`v-for`** + **`:key`**) — binding/iteration directives first
2. **`class`** — static class string (if any)
3. **UnoCSS attributify props** — shorthand utility classes used as props (e.g. `ma-2`, `flex`, `flex-col`)
4. **Component props with values** — `:prop="value"` or `prop="string"` (alphabetical within this group)
5. **Shorthand boolean props** — bare prop names that default to `true` (e.g. `clearable`, `hide-details`, `single-line`)
6. **Event handlers** — `@event="..."` last

Example:

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

- **Truthiness checks** — use `v-if="value"` not `v-if="value !== null"`. Explicit null/undefined comparisons are only needed when distinguishing between multiple falsy values (e.g. a number where `0` is valid, a boolean where `false` is meaningful, or when `null` vs `undefined` must be treated differently).

- **No bare function references in `@event` bindings** — bare references forward the DOM/Vue event object as the first argument, which is almost always unintended. Use `fn()` for zero-arg calls and an explicit arrow function when arguments are needed:

  ```vue
  <!-- CORRECT — zero-arg call, no event forwarding -->
  @click="onSave()" @keydown.enter="onSave()"

  <!-- CORRECT — arrow function when passing specific args -->
  @complete="(scene, tilemap) => useCreateTilemapAssets(scene, tilemap)"

  <!-- WRONG — forwards the click/keydown Event object as first arg -->
  @click="onSave" @keydown.enter="onSave"
  ```

- **`v-for` destructuring** — always destructure `v-for` bindings when properties are accessed in the template: `v-for="{ value, icon, title } of items"` not `v-for="item of items"` + `item.value`. Only keep a full reference when the whole object is needed (e.g. passed as a prop or stored in a ref). In that case, name the loop variable to match the prop it will be passed to, enabling `:propName` shorthand.
- **`#activator` always first** — in components that use both `#activator` and other slots (e.g. `v-tooltip`, `v-menu`), always place the `#activator` template as the first child.
- **Slot names with dots always use dynamic binding** — Vue does not support dots in static slot names, so Vuetify item slots always require the bracket syntax: `#[`item.drag`]`, `#[`item.actions`]`. Only plain names without dots can be static (e.g. `#top`, `#activator`).
- **Always use `:` shorthand** instead of `v-bind:propName` — write `:disabled="..."` not `v-bind:disabled="..."`. The object-spread form also has a shorthand: use `:="object"` instead of `v-bind="object"`.
- **Never use `.value` in templates** — Vue auto-unwraps refs in template expressions. Writing `ref.value` in a template accesses `.value` on the already-unwrapped object (not on the ref), which is almost always `undefined`. Write `fn(ref)` not `fn(ref.value)`. `.value` is only needed in `<script setup>` (outside template expressions).

## Optional Refs — Omit the Initial Value

When a ref is initially `undefined`, **do not pass `undefined` as the argument** — just omit it. Vue's `ref<T>()` overload infers `Ref<T | undefined>` automatically:

```typescript
// WRONG — explicit undefined is redundant
const callRoomId = ref<string | undefined>(undefined);

// CORRECT — omit the argument; type is Ref<string | undefined>
const callRoomId = ref<string>();
```

The same applies to other nullable-initial refs: `ref<User>()`, `ref<number>()`, etc.

## defineProps — Always Use Named `interface <ComponentName>Props`

Always declare a named interface suffixed with `Props` and named after the component, then pass it to `defineProps<...>()`. Never use the inline object-literal type or a plain `interface Props`.

```ts
// CORRECT — name reflects the component
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
const props = defineProps<Props>();
```

Name the interface after the component's meaningful identity (file/folder name, stripping `Index`). For `PreJoin/Index.vue` → `interface PreJoinProps`. For `JoinNotice/KnockerItem.vue` → `interface KnockerItemProps`.

## Refs & Computed

- **Template refs** — always use `useTemplateRef` for both component and HTML element refs. **Never annotate with a generic type argument** — Vue 3.5+ infers the type from the template automatically. **Never add a `Ref` suffix to the variable name.**

  ```ts
  // CORRECT — no generic, no "Ref" suffix, matches the ref="video" attribute
  const video = useTemplateRef("video");

  // WRONG — spurious type annotation
  const video = useTemplateRef<HTMLVideoElement>("video");

  // WRONG — spurious import + "Ref" suffix
  import type MyDialog from "@/components/MyDialog.vue";
  const dialogRef = useTemplateRef<InstanceType<typeof MyDialog>>("dialogRef");
  ```

  Use a semantic name matching the `ref="..."` attribute value (e.g. `"video"`, `"container"`, `"dialog"` — never `"videoRef"`, `"divRef"`). If a component type was only imported for the `useTemplateRef` generic, remove that import entirely.

- **Sort at display time** — apply `.toSorted()` inside the `computed` that feeds the template; never sort in store ingestion (`readX`, `setX`, mutation helpers). Stores hold data in natural order; components transform for display. **Exception**: when the sorted order must be sent to the backend (e.g. message pagination cursors), sort before the API call instead.
- **Computed for reused expressions** — extract a `computed` (named to match the prop, e.g. `title`) when the same derived value is bound to two or more props. This enables the `:propName` shorthand for one binding and avoids repeating the expression: `const title = computed(() => ...)` → `:title :tooltip-text="title"`. No need for a computed if the value is only used in one place.
- **Inline prop values** — inline prop values directly in the template to take advantage of Vue TypeScript inference. Only extract to a `computed` when the same logic is reused in multiple places. Single-use derived values stay inline.
- **Map lookups over computed** — when a value depends on an enum/discriminant key, use a `Map[type]` lookup directly in the template instead of a computed. If multiple properties are needed from the same map entry, use `Map[type].value`. Only fall back to computed when the same map lookup is duplicated in two or more places.
- **Writable computed over watch + local ref** — when a local boolean ref is entirely derived from (and writes back to) a store value, replace both the `ref` and the `watch` with a writable `computed`. This eliminates the indirect trigger pattern and keeps the store as the single source of truth:

  ```typescript
  // WRONG — local ref + watch as indirect trigger
  const isUpdateMode = ref(false);
  watch(editingRowKey, (newEditingRowKey) => {
    if (newEditingRowKey !== message.rowKey) return;
    isUpdateMode.value = true;
    editingRowKey.value = undefined;
  });

  // CORRECT — writable computed; no watch needed
  const isUpdateMode = computed({
    get: () => editingRowKey.value === message.rowKey,
    set: (value) => {
      editingRowKey.value = value ? message.rowKey : undefined;
    },
  });
  ```

## Conditional Logic

When branching on a type/discriminant, use in this priority order:

1. **Map lookup** — `Map[type]` inline in template (preferred)
2. **`switch` expression** — use a `switch` in script when a map is impractical
3. **`if / else if / else`** — explicit branches for complex conditions
4. **Never** chain standalone `if` statements for mutually exclusive conditions. Always use `else if` / `else` or a `switch`.

## Auth Session

Always pass `useFetch` as the argument to `authClient.useSession()` in Vue components. This makes better-auth use Nuxt's SSR-aware `useFetch` internally instead of its default fetch:

```ts
// CORRECT — SSR-aware
const { data: session } = await authClient.useSession(useFetch);

// WRONG — skips Nuxt's useFetch, breaks SSR
const { data: session } = await authClient.useSession();
```

## Upsert Forms — Create vs Edit Mode

When a form component handles both create and edit, use an explicit `isCreate` prop (default `false`) rather than deriving mode from the presence of `initialValues`. The parent page knows the intent and passes `is-create` explicitly.

For local form state, use a single `values` ref over separate per-field refs:

```ts
interface PostUpsertFormProps {
  initialValues?: Pick<Post, "description" | "title">;
  isCreate?: boolean;
}

const { initialValues = { description: "", title: "" }, isCreate = false } = defineProps<PostUpsertFormProps>();
const values = ref(initialValues);
```

- Template binds to `values.title`, `values.description` — Vue auto-unwraps the ref
- Emit passes `values` directly (auto-unwrapped in template to the plain object)
- `isCreate` drives button text: `isCreate ? 'Post' : 'Edit Post'`
- Create page passes `is-create`; update page passes `:initial-values` — no `is-create`

The same `isCreate?: boolean` pattern applies to dialog buttons (e.g. `CrudView/EditDialogButton`) where it also skips the equality check that would otherwise disable the save button when form state matches the original.

## After Finishing Code Changes

1. Run `pnpm format` from the **repo root** — formats all packages at once (~1.6s, oxfmt).
2. Run `pnpm typecheck` in `packages/app` as a background task — takes too long to block on. The user reviews results when ready.

## Watch Decision Tree — When to Use (and When Not to Use) `watch`

Reach for `watch` only after exhausting these alternatives:

### 1. Read-only derived value → `computed`

If a value is entirely derived from existing reactive state and never independently set, use `computed`. No `watch` needed.

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

When a component has local form state that starts from a prop or store value but is independently editable by the user, initialize the `ref` directly. **Never use `watchImmediate` just to set an initial value** — that is always a code smell.

```typescript
// WRONG — watchImmediate to initialize is redundant; ref starts as null then immediately overwritten
const selectedCategoryId = ref<null | string>(null);
watchImmediate(
  () => room.value?.categoryId,
  (categoryId) => {
    selectedCategoryId.value = categoryId ?? null;
  },
);

// CORRECT — initialize directly; no watch needed
const selectedCategoryId = ref(room.value?.categoryId ?? null);
```

If the source can change externally while the form is open (e.g. real-time collaboration), add a plain `watch` — but not `watchImmediate`:

```typescript
const selectedCategoryId = ref(room.value?.categoryId ?? null);
watch(
  () => room.value?.categoryId,
  (categoryId) => {
    selectedCategoryId.value = categoryId ?? null;
  },
);
```

**Prefer props-down when the parent is adjacent and already has the data.** If the immediate parent already computes the value, pass it as a prop. The child initializes from the prop — no watch, no store duplication:

```typescript
// Parent passes :category-id="room?.categoryId ?? null"
// Child:
const { categoryId } = defineProps<Props>();
const selectedCategoryId = ref(categoryId); // no watch, no store read
```

Only pass through an intermediate generic router component (e.g. `Content.vue` that routes to all settings types) if the prop is truly shared by all children. If only one specific settings type needs it, keep the store read in the leaf component and just initialize the ref directly.

### 3. Reset form state when a dialog/menu opens → only if data changes externally

Ask: **can the underlying data change between opens from an external source** (WebSocket push, another tab, another user)?

- **Yes** → `watch` the open boolean and reset on open
- **No** → just initialize the `ref` once at setup; the watch is ceremony

```typescript
// ONLY justified if status can change from an external source (e.g. WebSocket)
watch(menu, (isOpen) => {
  if (!isOpen) return;
  selectedStatus.value = status.value;
  statusMessage.value = message.value;
});

// If this component is the only mutation path, skip the watch entirely:
const selectedStatus = ref(status.value); // initialized once; fine
```

If the user opens → changes → closes without saving → reopens, they'll see their unsaved selection. That is usually acceptable (or even desirable — they indicated intent). The watch-to-reset pattern forces a reset on every open, which can feel punishing.

### 4. Bridging to external imperative APIs → `watch` is correct

Vue's reactivity cannot reach into Phaser, Three.js, Tiptap, Desmos, or any DOM-imperative API. `watch` is the correct bridge:

```typescript
watch(isDark, (newIsDark) => {
  calculator.updateSettings({ invertedColors: newIsDark });
});
```

### 5. Async side effects triggered by reactive state → `watch` is correct

Auto-save, API calls on throttled search, typing indicators — these are inherently imperative:

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

## Watch Aliases

Prefer `watchDeep(source, cb)` over `watch(source, cb, { deep: true })` and `watchImmediate(source, cb)` over `watch(source, cb, { immediate: true })`. When both flags are needed, use `watchDeep(source, cb, { immediate: true })` (alphabetical: deep before immediate).

## Prefer `watch` Over `watchEffect`

Always use `watch` with explicit dependencies instead of `watchEffect`. `watchEffect` tracks dependencies implicitly, making them hard to audit and prone to unexpected re-runs when unrelated reactive data changes.

```typescript
// WRONG — implicit tracking, hard to audit
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

For a prop dependency, wrap it in a getter: `() => isActive`.

## Vue Hooks

- Always place `watch`, `onMounted`, `onUnmounted`, and other Vue lifecycle hooks/watchers at the **bottom** of `<script setup>`, after all `const` assignments.
- Always put a blank line before them to visually separate them from regular `const` assignments.
- Always wrap the callback in an explicit arrow function — never pass a function reference directly. This avoids scope/binding issues and prevents accidental argument forwarding: `onUnmounted(() => { reset(); })` not `onUnmounted(reset)`.
- This applies everywhere — `.map()`, `.filter()`, lifecycle hooks, JS event listeners, etc. Always use `array.map((item) => fn(item))` not `array.map(fn)`. Vue template `@event` bindings are handled separately in Template Conventions: use `@click="fn()"` (call expression), not `@click="fn"` (bare reference).

## Browser Globals — Always Use `window.` Prefix

Always prefix browser-only globals with `window.` for clarity. This makes it explicit that the code is browser-only and won't run on the server:

```typescript
// WRONG
document.getElementById(id);
document.querySelector("label");
document.createElement("a");
document.body.appendChild(element);
document.documentElement.animate(...);
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const pc = new RTCPeerConnection({ iceServers });
const ctx = new AudioContext();
const audio = new Audio();
const frame = requestAnimationFrame(cb);
cancelAnimationFrame(frame);

// CORRECT
window.document.getElementById(id);
window.document.querySelector("label");
window.document.createElement("a");
window.document.body.appendChild(element);
window.document.documentElement.animate(...);
const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
const pc = new window.RTCPeerConnection({ iceServers });
const ctx = new window.AudioContext();
const audio = new window.Audio();
const frame = window.requestAnimationFrame(cb);
window.cancelAnimationFrame(frame);
```

Standard built-ins available in all environments (Node.js + browser) do **not** need the `window.` prefix: `Uint8Array`, `Map`, `Set`, `JSON`, `Promise`, `crypto`, etc.

## SSR Guards — Always Use `getIsServer()`

Always use `getIsServer()` from `@esposter/shared` to guard browser-only code. Never use `import.meta.client` or `typeof window !== "undefined"` — `getIsServer()` is consistent across Nuxt app code, shared packages, and Azure Functions.

```typescript
// WRONG
if (import.meta.client) { ... }
if (typeof window !== "undefined") { ... }

// CORRECT
if (!getIsServer()) { ... }

// Example: useScript use callback
useScript<typeof Desmos>(API_URL, {
  use: () => (getIsServer() ? undefined : window.Desmos) as typeof Desmos,
});
```

## Routing

- **`useRouter()` for reactive contexts** — use when reading route data inside a `computed` or `watch` (e.g. `router.currentRoute.value.params.id` in a `computed`), or when calling navigation methods (`router.push`, `router.replace`).
- **`useRoute()` for plain reads** — use when reading params/query outside of a reactive context (e.g. inside a regular function or async handler).

## Vuetify

See the **vuetify** skill for all Vuetify-specific conventions.
