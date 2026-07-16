---
name: vue
description: Esposter Vue 3 SFC conventions — macro ordering, script-setup declaration order, template patterns and attribute ordering, inline handlers, v-model vs split bindings (never normalizeString in Vue), refs/computed/template refs, the watch decision tree and watch aliases, auth session call forms, browser globals, SSR guards via getIsServer, and upsert form mode. Apply when writing or reviewing .vue files.
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

Declare composables and state in this order:

0. **Page-metadata side-effects** — `useHead`, `useSeoMeta` belong near the **top**. A metadata call with no local-state dependency may sit even **above** `defineSlots`/the macros. One that references reactive state (a store ref, `useRuntimeConfig`) stays just after that state is declared (still above unrelated logic).
1. **Macros** — `defineSlots` → `defineModel` → `defineProps` → `defineEmits` (see above). No blank line between the macros and the declarations that follow.
2. **Framework / third-party value composables** — those returning reusable reactive state/values: `useNuxtApp`, `useRoute`, `useRouter`, `useRuntimeConfig`, VueUse value composables (`useVDisplay`, `useWindowSize`, …), auth (`authClient.useSession`). Group these together immediately after the macros.
3. **Custom Pinia stores** — `useXStore` + `storeToRefs` + destructured methods, using per-store grouping (init → `storeToRefs` → methods, then the next store; never batch all inits then all refs).
4. **Custom composables, refs, computeds, watches, functions** — everything else (`useRoomName`, `useTemplateRef`, `ref`, `computed`, `watch`, handlers).

```ts
// CORRECT
useHead({ titleTemplate: ... });       // 0. static page metadata — top, may precede macros
defineSlots<{ default: () => VNode }>();
const { $trpc } = useNuxtApp();        // 2. third-party
const { smAndDown } = useVDisplay();   // 2. third-party
const roomStore = useRoomStore();      // 3. custom store
const { currentRoom } = storeToRefs(roomStore);
const roomName = useRoomName(...);     // 4. custom composable / state
```

Never leave a framework value composable (e.g. `useVDisplay`, `useRoute`) stranded at the bottom below custom stores and refs. **Exceptions that stay in place (category 4, not hoisted):** `useTemplateRef` (a ref — group with refs), and side-effect registrations that depend on local state (`useEventListener`, or a `useSeoMeta` that reads store refs) which must stay after the state they depend on.

## Inline Functions & Handlers

**A single-use function that only defers a block must be inlined.** A single reference is the _trigger_ for the question, not the answer to it. Ask what the name buys:

- **Ceremony → inline.** The name describes _when_ it runs (`onMount`, `init`, `load`, `setup`, `handleX`) and the body is simply the block its one caller would have contained. The name adds a jump and buys nothing, and inlining makes the file strictly smaller.
- **Abstraction → keep.** The name describes _what it computes_ (`getColumnType`, `isStyleNode`, `checkIsInteractableDirection`) and compresses a non-obvious computation — a switch, a predicate, a parse — so its call site reads as one idea. Inlining a 14-line switch into a loop body is bigger, more nested, and deletes the only word explaining what it means. Single use is not a reason to destroy it.

The discriminator: **does the name state its trigger or its result?** A trigger-named function is the caller wearing a disguise. A result-named function is a concept. Never inline a function whose call site would then need a comment to explain what the block does — that comment is the name you just removed.

Ceremony, in every form — not only callbacks passed as arguments:

- **Passed to a hook / registration** — `useEventListener("keydown", (event) => { ... })`, never a separate `onKeydown` used once. Arg types infer from the event name, so no annotation is needed.
- **Called inside a hook** — a named `onMount`/`init`/`load` that only `onMounted` invokes is the same violation wearing a different hat. Inline the body into `onMounted`. Wrapping it (`getResultAsync(onMount)`) does **not** make it a second reference:

  ```ts
  // WRONG — onMount is referenced once
  const onMount = async () => { ... };
  onMounted(async () => {
    await getResultAsync(onMount).match(noop, console.error);
    isLoading.value = false;
  });

  // CORRECT — the body lives where it runs
  onMounted(async () => {
    await getResultAsync(async () => { ... }).match(noop, console.error);
    isLoading.value = false;
  });
  ```

- **Template handlers** — a handler bound to exactly one element is ceremony, whatever its length. Inline it into the binding (`@submit="async (_, onComplete) => { ... }"`), which also lets Vue infer the event arg types. Multi-statement and `async` bodies are fine inline; the handler's trigger is the element it sits on, so that is where it belongs:

  ```vue
  <!-- WRONG — copyPublicLink is bound once -->
  <StyledTooltipIconButton icon="mdi-content-copy" text="Copy link" @click="copyPublicLink" />

  <!-- CORRECT -->
  <StyledTooltipIconButton icon="mdi-content-copy" text="Copy link" @click="async () => { ... }" />
  ```

  The one exception is **scope**: a template expression can only reach bindings `<script setup>` exposes to it. Top-level `const`s and imports are exposed, so `getResultAsync`/`noop`/a store method all inline fine. Things the template cannot name — `window` and other browser globals, a local `let`, a type annotation the body needs — force the handler to stay in script:

  ```ts
  // Stays named: the template cannot reference window
  const copyPublicLink = async () => {
    if (!publicUrl.value) return;
    await getResultAsync(() =>
      window.navigator.clipboard.writeText(`${window.location.origin}${publicUrl.value}`),
    ).match(noop, noop);
  };
  ```

- **Trivially-typed lambdas** — never extract one whose arg types are already inferable.

Legitimate reasons to keep a name:

- It names a **result**, not a trigger (see above) — single use is fine.
- The handler references something the **template has no scope for** (`window.…`, a type annotation) — see above.
- The same **reference** is needed twice (`addEventListener` + `removeEventListener`), or one handler is bound to two elements.
- It is the component's **public API** via `defineExpose({ onKeyDown })` — the expose _is_ the second reference.
- A mutation must re-run a setup read: `refreshResponses` awaited at setup **and** bound to `@delete`.

- **Prefer `useEventListener` over manual `addEventListener`/`removeEventListener`** — it auto-removes on unmount, so it replaces an `onMounted` (add) + `onUnmounted` (remove) pair and lets the handler be inlined. Omit the target for `window` events (`useEventListener("resize", ...)`) — the omitted-target form is SSR-safe (don't reference `window` at setup top-level). Fall back to manual `onMounted`/`onUnmounted` only when the target isn't reachable SSR-safely as a getter and the listener is genuinely tied to mount.
- **`@click` shorthand**: a single async call uses `@click="myAsyncFn(args)"` directly — no `async () => { await ... }` wrapper.
- **IME composition guard** — on `@keydown.enter` for text inputs, guard inline so confirming a CJK candidate doesn't commit: `@keydown.enter.stop="!$event.isComposing && commitEdit()"`.
- **Never destructure event parameters** — use `(event: KeyboardEvent) => { event.key ... }` not `({ key })`. Destructuring event methods (`preventDefault`, etc.) causes "Illegal invocation" via lost `this` binding. Keep the full `event` object even when only reading properties.

## v-model vs Split Bindings

Prefer `v-model="ref"` over the split `:model-value` + `@update:model-value` whenever the update is a direct assignment to a single ref.

```vue
<v-text-field v-model="name" />
```

Keep the split form only when genuinely needed:

- **Computed get** — `:model-value` derives from more than a bare ref (e.g. `a?.b ?? c`)
- **Multiple writes on update** — the handler sets more than one ref
- **Extra-arg function call** — `@update:model-value="setFilter(key, $event)"`
- **Dynamic property assignment** — `@update:model-value="row[col] = $event"`
- **Genuine value transformation** — unit/date-format conversion, bitwise ops (stored value differs structurally from displayed)

### `normalizeString` Never in Vue

Never apply `normalizeString` (or any trimming) anywhere in Vue — not in `@update:model-value`, not in submit handlers. The Zod input schemas for tRPC mutations already normalize via `createNameSchema`/`createNormalizedStringSchema` (`.transform(normalizeString).pipe(...)`). Duplicating is redundant, and in `@update:model-value` actively harmful (trims mid-typing, swallows spaces). Let raw input flow through `v-model="name"`.

Other consequences of trusting the server schema:

- **Validity / disabled-button checks** — use `safeParse` on the shared schema: `:disabled="!nameSchema.safeParse(name).success"`.
- **Dirty-state comparisons** — parse both sides so normalized values compare: `topicSchema.safeParse(editedTopic).data !== storedTopic`.
- **Submit/mutation handlers** — pass raw values; no `safeParse` guards, emptiness checks, or local normalization before mutating local state.

The only acceptable client-side validation is Vuetify form field rules (inline errors) and disabled-button state driven by `safeParse().success` on a shared schema. `normalizeString` remains valid in non-Vue, non-form contexts (text-parsing utilities, CSV/XLSX deserialization, slash-command parsing) — anything not crossing a tRPC Zod boundary.

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
  @click="onSave()" @complete="(scene, tilemap) => useCreateTilemapAssets(scene, tilemap)"
  ```

- **`v-for` destructuring** — destructure when properties are accessed: `v-for="{ value, icon, title } of items"` not `item.value`. Keep a full reference only when the whole object is needed (passed as prop or stored); name the loop var to match the target prop for `:propName` shorthand.
- **`#activator` always first** — in `v-tooltip`/`v-menu` etc., place `#activator` as the first child.
- **Dotted slot names need dynamic binding** — Vue rejects dots in static slot names; Vuetify item slots use brackets: `#[`item.drag`]`, `#[`item.actions`]`. Only dot-free names are static (`#top`, `#activator`).
- **Always use `:` shorthand** — `:disabled="..."` not `v-bind:disabled`. Object spread: `:="object"` not `v-bind="object"`.
- **Never use `.value` in templates** — Vue auto-unwraps refs. `ref.value` in a template reads `.value` on the unwrapped object (usually `undefined`). Write `fn(ref)`. `.value` is only for `<script setup>` outside template expressions.
- **No allocating expressions in render positions** — `Object.*` calls in a `:prop` bind, `v-for` source, or `{{ }}` allocate a fresh reference every render. Enforced by `vue/no-restricted-syntax` (`packages/configuration/eslint/overrides/vueRules.js`); its message states the fix (hoist to a script-setup `const` for static sources, a `computed` for reactive ones) and exempts event handlers.
- Reassigning a `defineModel` vs mutating it in place is a deliberate semantic choice — don't "fix" one into the other.
- **`import type` names ARE visible in template casts** — a type-only imported name works in a template `as` cast (`$event as NoiseSuppressionMode`); never widen it to a value import for the cast's sake. Only a template _value_ usage — enum member access (`FooType.Bar`), a `v-for` source, a call — needs the value import. When vue-tsc reports TS2551 `Property 'X' does not exist on type '{ …ctx… }'` on a template identifier, the culprit is a value usage of a type-only import somewhere in the template, not the cast — find it before changing import forms.

## Optional Refs — Omit the Initial Value

When a ref is initially `undefined`, omit the argument — `ref<T>()` infers `Ref<T | undefined>`:

```typescript
const callRoomId = ref<string>(); // not ref<string | undefined>(undefined)
```

## defineProps — Named `interface <ComponentName>Props`

Declare a named interface suffixed `Props`, named after the component, then pass to `defineProps<...>()`. Never use an inline object-literal type or a plain `interface Props`.

```ts
interface KnockerItemProps {
  knocker: CallParticipant;
}
const props = defineProps<KnockerItemProps>();
```

Name after the component's identity (file/folder name, stripping `Index`): `PreJoin/Index.vue` → `PreJoinProps`; `JoinNotice/KnockerItem.vue` → `KnockerItemProps`.

**Prop shorthand naming** — when binding a simple local `ref`/`computed` directly to a prop, name it to match that prop so the `:prop` shorthand works: `const dataSourceType = ref(...)` → `:dataSourceType`. Doesn't apply to complex expressions (`:src="session.user.image"`) or named `defineModel` variables.

## Refs & Computed

- **Template refs** — always use `useTemplateRef`. Prefer no generic (Vue 3.5+ infers from the template). Never add a `Ref` suffix. Use a semantic name matching the `ref="..."` value (`"video"`, never `"videoRef"`). If a component type was imported only for the generic, remove that import.

  ```ts
  const video = useTemplateRef("video"); // no generic, no "Ref" suffix
  ```

  **Generic is justified only when template inference doesn't give the type you need**: (1) the element/component the `ref` sits on doesn't expose the property you actually want, or (2) the inferred type is an overly complex union you want to simplify.

- **Sort at display time** — apply `.toSorted()` in the `computed` that feeds the template; never sort in store ingestion (`readX`, `setX`, mutation helpers). Stores hold natural order; components transform for display. **Exception**: sort before the API call when sorted order is sent to the backend (e.g. message pagination cursors).
- **Computed for reused expressions** — extract a `computed` (named to match the prop) when the same derived value binds to 2+ props; enables `:propName` shorthand. Single-use values stay inline.
- **Inline prop values** — inline directly to leverage Vue inference; extract to `computed` only when reused.
- **Map lookups over computed** — when a value depends on an enum/discriminant key, use `Map[type]` directly in the template (`Map[type].value` for multiple properties). Fall back to computed only when the lookup is duplicated 2+ places.
- **Writable computed over watch + local ref** — when a local boolean ref is entirely derived from and writes back to a store value, replace the `ref` + `watch` with a writable `computed`:

  ```typescript
  // writable computed; no watch
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

Two call forms, picked by context:

- **Async SSR-relevant context** (component `<script setup>`, async composable, route middleware) — `await authClient.useSession(useFetch)` so better-auth fetches via Nuxt's SSR-aware `useFetch` and the session is populated during SSR/hydration. Destructure `data` and access as `session.value?.user.id`.
- **Synchronous / client-only context** — `authClient.useSession()` (no `useFetch`, not awaited) returns a reactive ref accessed as `session.value.data?.user.id`. Required wherever you can't `await`: Pinia setup stores (synchronous) and synchronous composables; fine for client-only features (subscriptions, IndexedDB cache, WebRTC, action handlers) that never need the session at SSR time.

```ts
// async context — SSR-aware; note the destructure flips the access shape to session.value?.user.id
const { data: session } = await authClient.useSession(useFetch);

// synchronous store / client-only composable — no await possible; access session.value.data?.user.id
const session = authClient.useSession();
```

`useFetch` returns a promise, so it can only be passed where you can `await`. Don't make a synchronous composable `async` just to add `useFetch` unless it genuinely runs during SSR.

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
const displayName = computed(() => user.value?.name ?? "");
```

### 2. Form state initialized from props/store → initialize the `ref` directly

Local form state starting from a prop/store value but independently editable: initialize the `ref` directly. **Never use `watchImmediate` just to set an initial value** — always a code smell.

```typescript
const selectedCategoryId = ref(room.value?.categoryId ?? null);
```

If the source can change externally while the form is open (e.g. real-time collaboration, an optimistic store that rolls back on failure), the local copy must **resync** when the source changes. Use VueUse's `useCloned` — never a hand-written `ref` + `watch` mirror:

```typescript
// useCloned owns the editable copy and resyncs automatically
const { cloned: selectedCategoryId } = useCloned(() => room.value?.categoryId ?? null);
```

`useCloned(source, options)` returns `{ cloned, isModified, sync }`:

- `cloned` is a **writable** ref (bind it with `v-model`); it re-clones whenever `source` changes, so a rollback or external edit flows back into the form.
- Fold any normalization into the **source getter** (`() => x ?? ""`) rather than a custom clone.
- Default clone is `JSON.parse(JSON.stringify(...))` — fine for primitives/plain objects. For values that JSON can't round-trip (Dates, class instances, reactive proxies), pass a `clone` and `deep: true`, and use the returned `sync` as the reset handler instead of a separate `resetForm`:

  ```typescript
  const { cloned: editedRow, sync: resetForm } = useCloned(() => row, {
    clone: (source) => structuredClone(toRawDeep(source)),
    deep: true,
  });
  ```

`useCloned` also covers writable local copies driven by an imperative consumer (a `v-model` an external widget mutates) that must still resync from a reactive source — e.g. `const { cloned: darkMode } = useCloned(isDark)` bound to `v-model:dark-mode`.

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

### 4. Async read of a source the instance can't outlive → `onMounted`, not `watch`

Before watching an id to re-read on change, ask: **can it actually change under this instance?** When the router or the parent already keys the component by that id, a change unmounts and remounts it — the watch's re-run branch is dead code, and any staleness guard defends a transition that cannot happen.

Resource pages are keyed by id (`definePageMeta({ key: (route) => \`resource-${route.params.id}\` })`), and `BladeOutlet` keys each blade by `\`${resource.id}-${activeBlade}\``inside`<Suspense>`. So inside a page, an Overview, or a blade, the resource id is **fixed for the instance's lifetime**:

```typescript
// The page is keyed by resource id, so this instance only ever describes one resource — read once
const viewCount = ref<number>();
onMounted(async () => {
  viewCount.value = await getResultAsync(() => readResourceViewCount({ id: resource.id })).unwrapOr(undefined);
});

// Not: watchImmediate(() => resource.id, ...) — the id cannot change, so the watch is a once-only hook
// Wearing a reactive costume, and it invites stale-response guards for a race that cannot occur
```

A blade sits inside `<Suspense>`, so it can go further and `await` the read at setup — the `<Suspense>` fallback renders the skeleton, replacing a local `isLoading` ref:

```typescript
const id = route.params.id as string; // keyed by id upstream, so a plain cast is safe
await refreshResponses(); // Suspense shows StyledSkeleton until this resolves
```

Keep the read in a named function when a mutation must re-run it (a delete dialog's `@delete`), and call that same function at setup.

**A watch is only right here when the source genuinely varies under a live instance** — a reactive reference bound to a form control, e.g. `useDataset(() => modelValue.value?.reference)` in a picker. Then the concurrency guard earns its place, because two reads really can overlap.

### 5. Bridging to external imperative APIs → `watch` is correct

Vue reactivity can't reach Phaser, Three.js, Tiptap, Desmos, or DOM-imperative APIs:

```typescript
watch(isDark, (newIsDark) => {
  calculator.updateSettings({ invertedColors: newIsDark });
});
```

### 6. Async side effects triggered by reactive state → `watch` is correct

Auto-save, API calls on throttled search, typing indicators — the source genuinely changes under a live instance (see case 4 before reaching for this):

```typescript
watch(throttledSearchQuery, async (newQuery) => {
  const results = await search(newQuery);
  initializePaginationData(results);
});
```

## Watch Aliases & `watchEffect`

- Prefer `watchDeep(source, cb)` over `watch(source, cb, { deep: true })` and `watchImmediate(source, cb)` over `{ immediate: true }`. When both needed: `watchDeep(source, cb, { immediate: true })` (alphabetical: deep before immediate).
- Always use `watch` with explicit dependencies instead of `watchEffect` — implicit tracking is hard to audit and re-runs on unrelated changes. Wrap a prop dependency in a getter: `() => isActive`.

  ```typescript
  // explicit dependencies — not watchEffect's implicit tracking
  watch([gem, roughnessMap], ([newGem, newRoughnessMap]) => {
    if (!newGem) return;
    newGem.material.roughnessMap = newRoughnessMap;
  });
  ```

## Vue Hooks

- Place `watch`, `onMounted`, `onUnmounted`, and other lifecycle hooks/watchers at the **bottom** of `<script setup>`, after all `const` assignments, with a blank line before them.
- **Prefer no hook at all** — exhaust the Watch Decision Tree above first. A `watchEffect` that merely copies a store value into a local `ref` is almost always replaceable by the wrapper + pure-child pattern (see the `vue-component-patterns` skill): guard the source with `v-if` in the parent, pass it as a required prop, and init the child's `ref` from that prop.
- **Blank line between each consecutive hook/watcher** — every `watch`/`watchEffect`/`onMounted`/`onUnmounted` block is an independent registration, so put a blank line between adjacent ones. This overrides the `formatting` skill's "no blank line before a block that immediately follows another block".
- **Order by lifecycle phase**: `watch`/`watchEffect` first, then `onMounted`, then `onUnmounted` (setup-time reactive registrations precede mount-time, which precede teardown). Within the same phase keep source order.
- Always wrap the callback in an explicit arrow function — never pass a function reference directly (avoids scope/binding issues and argument forwarding): `onUnmounted(() => { reset(); })` not `onUnmounted(reset)`.
- Applies everywhere — `.map()`, `.filter()`, lifecycle hooks, JS event listeners: `array.map((item) => fn(item))` not `array.map(fn)`. (Template `@event` bindings: use `@click="fn()"`, not `@click="fn"` — see Template Conventions.)

## Browser Globals — Always Use `window.` Prefix

Prefix browser-only globals with `window.` to make browser-only code explicit (won't run on server):

```typescript
window.document.getElementById(id);
const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
const pc = new window.RTCPeerConnection({ iceServers });
const frame = window.requestAnimationFrame(cb);
```

Standard built-ins available in all environments (`Uint8Array`, `Map`, `Set`, `JSON`, `Promise`, `crypto`, etc.) do **not** need `window.`.

## SSR Guards — Always Use `getIsServer()`

Use `getIsServer()` from `@esposter/shared` to guard browser-only code. Never `import.meta.client` or `typeof window !== "undefined"` — `getIsServer()` is consistent across Nuxt, shared packages, and Azure Functions.

```typescript
if (!getIsServer()) { ... } // not import.meta.client / typeof window

useScript<typeof Desmos>(API_URL, {
  use: () => (getIsServer() ? undefined : window.Desmos) as typeof Desmos,
});
```

## Routing

See the **routing** skill — links/`:to`, `navigateTo`, reactive route reads, route validation, page keys, and route-synced tabs.

## After Finishing Code Changes

1. Run `pnpm format` from the **repo root** — formats all packages (~1.6s, oxfmt).
2. Run `pnpm typecheck` in `packages/app` as a background task — too long to block on; user reviews when ready.

## Vuetify

See the **vuetify** skill for all Vuetify-specific conventions.
