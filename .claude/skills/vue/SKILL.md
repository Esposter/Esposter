---
name: vue
description: Esposter Vue 3 SFC conventions — macro ordering, script-setup declaration order, template attribute ordering and template conventions, inlining single-use functions and handlers (ceremony vs abstraction, useEventListener, IME guard), v-model vs split bindings, never normalizeString in Vue (server Zod schemas normalize; safeParse drives disabled state), upsert create/edit form mode, optional refs, useTemplateRef, computed and map-lookup preferences, the watch decision tree (computed, direct ref init, useCloned, keyed-instance onMounted) plus watch aliases and hook placement, auth session call forms, browser globals via window., and SSR guards via getIsServer. Apply when writing or reviewing .vue files.
---

# Vue Conventions

- `<script setup lang="ts">` at the top of every SFC. Prefer attributify over `<style>` blocks; when a block is genuinely needed use `<style scoped>`, and only add `lang="scss"` for Sass features (nesting, `&`, `//` comments, `@mixin`/`@include`). See the `styling` skill.
- Self-closing tags for empty components/elements: `<Component />`.
- Blank-line placement (templates, consts, returns, blocks) and comment attachment — see the `formatting` skill.
- Links, `:to`, `navigateTo`, reactive route reads, route validation, page keys and route-synced tabs — see the `routing` skill. All Vuetify-specific conventions — see the `vuetify` skill.

## Vue Macro Ordering

`defineSlots` → `defineModel` → `defineProps` → `defineEmits`, then all `const` assignments, then `defineExpose` last (preceded by a blank line, before any `watch`/lifecycle hooks).

- **`defineModel`**: always type explicitly. For booleans pass `{ default: false }` so the type excludes `undefined`: `defineModel<boolean>({ default: false })`. Never declare `defineModel` unless the value is used in script (`watch`, `computed`, or passed) — otherwise use `:prop` + `@event`. For an **unnamed** model, name the variable `modelValue` (never `model` or another alias): `const modelValue = defineModel<string>()`. For a **named** model, the variable matches the name: `const title = defineModel<string>("title")`.
- **`defineSlots`**: only assign to `const slots` when `slots` is referenced in script. Otherwise call `defineSlots<...>()` without assignment.

## Script Setup Declaration Order

0. **Page-metadata side-effects** — `useHead`, `useSeoMeta` near the **top**; one with no local-state dependency may sit even **above** the macros. One that references reactive state (a store ref, `useRuntimeConfig`) stays just after that state is declared, still above unrelated logic.
1. **Macros** — see above. No blank line between the macros and the declarations that follow.
2. **Framework / third-party value composables** — `useNuxtApp`, `useRoute`, `useRouter`, `useRuntimeConfig`, VueUse value composables (`useVDisplay`, `useWindowSize`, …), auth (`authClient.useSession`). Grouped immediately after the macros.
3. **Custom Pinia stores** — `useXStore` + `storeToRefs` + destructured methods; the per-store grouping order is the `pinia` skill's.
4. **Custom composables, refs, computeds, watches, functions** — everything else.

```ts
useHead({ titleTemplate: ... });       // 0. static page metadata — top, may precede macros
defineSlots<{ default: () => VNode }>();
const { $trpc } = useNuxtApp();        // 2. third-party
const roomStore = useRoomStore();      // 3. custom store
const { currentRoom } = storeToRefs(roomStore);
const roomName = useRoomName(...);     // 4. custom composable / state
```

Never leave a framework value composable stranded at the bottom below custom stores and refs. **Exceptions that stay in category 4:** `useTemplateRef` (a ref — group with refs), and side-effect registrations that depend on local state (`useEventListener`, a `useSeoMeta` reading store refs) which must stay after the state they depend on.

## Single-use functions must be inlined — `references/inline-handlers.md`

Read it when naming, extracting or reviewing a function used once. **A single-use function that only defers a block must be inlined**; the discriminator is whether its name states its _trigger_ (`onMount`, `handleX` — inline it, including template handlers however long) or its _result_ (`getColumnType` — keep it, single use is fine). The page owns every form of ceremony, the template-scope exception, and the list of legitimate keeps.

- **Prefer `useEventListener` over manual `addEventListener`/`removeEventListener`** — it auto-removes on unmount, replacing an `onMounted`/`onUnmounted` pair and letting the handler be inlined. Omit the target for `window` events (`useEventListener("resize", ...)`) — the omitted-target form is SSR-safe (don't reference `window` at setup top-level). Fall back to manual hooks only when the target isn't reachable SSR-safely as a getter and the listener is genuinely tied to mount.
- **Never destructure event parameters** — `(event: KeyboardEvent) => { event.key ... }`, not `({ key })`. Destructuring event methods (`preventDefault`, …) causes "Illegal invocation" via lost `this` binding. Keep the full `event` object even when only reading properties.

## v-model, Inputs and Forms — `references/forms.md`

Read it when an input needs the split `:model-value` + `@update:model-value` form, or when a form handles both create and edit (the `isCreate` prop, a single `values` ref).

- Prefer `v-model="ref"` over the split form whenever the update is a direct assignment to a single ref.
- **Never apply `normalizeString` (or any trimming) anywhere in Vue** — not in `@update:model-value`, not in submit handlers. tRPC input schemas already normalize (`createNameSchema`/`createNormalizedStringSchema` do `.transform(normalizeString).pipe(...)`); trimming in `@update:model-value` is actively harmful (trims mid-typing, swallows spaces). Let raw input flow through `v-model="name"`.
- Trusting the server schema: disabled-button/validity checks use `safeParse` on the shared schema (`:disabled="!nameSchema.safeParse(name).success"`); dirty-state comparisons parse **both** sides (`topicSchema.safeParse(editedTopic).data !== storedTopic`); submit/mutation handlers pass raw values with no `safeParse` guards, emptiness checks or local normalization.
- The only acceptable client-side validation is Vuetify field rules (inline errors) plus `safeParse().success` disabled state. `normalizeString` remains valid in non-Vue, non-form contexts (text parsing, CSV/XLSX deserialization, slash-command parsing) — anything not crossing a tRPC Zod boundary.

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
  clearable
  hide-details
  @keydown.enter.stop="submit()"
/>
```

## Template Conventions

- **Truthiness** — `v-if="value"`, not `v-if="value !== null"`. Explicit null/undefined comparisons only when distinguishing falsy values (`0` valid, `false` meaningful, `null` vs `undefined` matters).
- **No bare function references in `@event` bindings** — a bare ref forwards the event object as first arg (almost always unintended). Use `fn()` for zero-arg calls, an arrow function when args are needed: `@complete="(scene, tilemap) => useCreateTilemapAssets(scene, tilemap)"`.
- **`v-for` destructuring** — destructure when properties are accessed (`v-for="{ value, icon, title } of items"`); keep a full reference only when the whole object is needed (passed as prop or stored), naming the loop var to match the target prop for `:propName` shorthand.
- **Dotted slot names need dynamic binding** — Vue rejects dots in static slot names; Vuetify item slots use brackets: ``#[`item.drag`]``. Only dot-free names are static (`#top`, `#activator`). `#activator` ordering is the `vuetify` skill's.
- **`v-bind` shorthand** — the `:` forms (including `:="object"` and same-name `:prop`) are autofixed by `vue/v-bind-style` with `sameNameShorthand: "always"` (`packages/configuration/eslint/overrides/vueRules.js`); `pnpm lint:fix` settles it.
- **Never use `.value` in templates** — Vue auto-unwraps refs, so `ref.value` reads `.value` on the unwrapped object (usually `undefined`). Write `fn(ref)`; `.value` is for `<script setup>` only.
- **No allocating expressions in render positions** — `Object.*` calls in a `:prop` bind, `v-for` source or `{{ }}` allocate a fresh reference every render. Enforced by `vue/no-restricted-syntax`; its message states the fix (hoist to a script-setup `const` for static sources, a `computed` for reactive ones) and exempts event handlers.
- **Event modifiers over raw event methods** — an unconditional `preventDefault()`/`stopPropagation()` opening a template handler is what modifiers express (`@click.stop`, `@keydown.enter.prevent`); enforced for that shape by `vue/no-restricted-syntax`. Raw calls stay correct where no modifier can encode the trigger: behind a runtime guard (e.g. `preventDefault` only when the cursor sits at position 0), and in programmatic listeners (`useEventListener`, `onKeyStroke`, Tiptap `onKeyDown`) where modifiers don't exist. `stopImmediatePropagation()` is banned outright (lint-enforced) — it couples behavior to listener registration order.
- **`v-html` only on a plain element** — on a component (`<v-card-text v-html="html" />`) it compiles to an `innerHTML` prop that the component's own children patch drops, so the element renders empty in SSR and on the client with no warning. Wrap instead: `<v-card-text><div class="rich-text-content" v-html="html" /></v-card-text>`.
- Reassigning a `defineModel` vs mutating it in place is a deliberate semantic choice — don't "fix" one into the other.
- **`import type` names ARE visible in template casts** — a type-only imported name works in a template `as` cast (`$event as NoiseSuppressionMode`); never widen it to a value import for the cast's sake. Only a template _value_ usage — enum member access (`FooType.Bar`), a `v-for` source, a call — needs the value import. When vue-tsc reports TS2551 `Property 'X' does not exist on type '{ …ctx… }'` on a template identifier, the culprit is a value usage of a type-only import somewhere in the template, not the cast — find it before changing import forms.

## Props, Refs & Computed

- **`defineProps` takes a named `interface <ComponentName>Props`** — never an inline object-literal type or a plain `interface Props`. Name it after the component's identity (file/folder name, stripping `Index`): `PreJoin/Index.vue` → `PreJoinProps`; `JoinNotice/KnockerItem.vue` → `KnockerItemProps`.
- **Prop shorthand naming** — when binding a simple local `ref`/`computed` directly to a prop, name it to match that prop so the `:prop` shorthand works (`const dataSourceType = ref(...)` → `:dataSourceType`). Doesn't apply to complex expressions (`:src="session.user.image"`) or named `defineModel` variables.
- **Optional refs omit the initial value** — `ref<string>()` infers `Ref<string | undefined>`; never `ref<string | undefined>(undefined)`.
- **Template refs always use `useTemplateRef`** — prefer no generic (Vue 3.5+ infers from the template), never a `Ref` suffix, and use a semantic name matching the `ref="..."` value (`const video = useTemplateRef("video")`). If a component type was imported only for the generic, remove that import. A generic is justified only when inference doesn't give the type you need: the element/component doesn't expose the property you want, or the inferred type is an overly complex union you want to simplify.
- **Sort at display time** — apply `.toSorted()` in the `computed` that feeds the template; never in store ingestion (`readX`, `setX`, mutation helpers). Stores hold natural order; components transform for display. **Exception**: sort before the API call when sorted order is sent to the backend (message pagination cursors).
- **Computed for reused expressions** — extract a `computed` (named to match the prop) when the same derived value binds to 2+ props; single-use values stay inline to leverage Vue inference.
- **Map lookups over computed** — when a value depends on an enum/discriminant key, use `Map[type]` directly in the template (`Map[type].value` for multiple properties). Fall back to a computed only when the lookup is duplicated in 2+ places.
- **Writable computed over `watch` + local ref** — when a local value is entirely derived from and writes back to a store value, replace the `ref` + `watch` with a `computed({ get, set })`.

## Conditional Logic

Branch on a type/discriminant in priority order: **map lookup** (`Map[type]` inline in the template) → **`switch` expression** in script when a map is impractical → **`if / else if / else`** for complex conditions. **Never** chain standalone `if` statements for mutually exclusive conditions.

## Auth Session

- **Async SSR-relevant context** (component `<script setup>`, async composable, route middleware) — `const { data: session } = await authClient.useSession(useFetch)` so better-auth fetches via Nuxt's SSR-aware `useFetch` and the session populates during SSR/hydration. The destructure flips the access shape to `session.value?.user.id`.
- **Synchronous / client-only context** — `const session = authClient.useSession()` (no `useFetch`, not awaited) returns a reactive ref accessed as `session.value.data?.user.id`. Required wherever you can't `await`: Pinia setup stores and synchronous composables; fine for client-only features (subscriptions, IndexedDB cache, WebRTC, action handlers) that never need the session at SSR time.
- `useFetch` returns a promise, so it can only be passed where you can `await`. Don't make a synchronous composable `async` just to add it unless it genuinely runs during SSR.

## When (not) to `watch` — `references/watch-decision-tree.md`

Read it before writing any `watch`, or when a local `ref` mirrors a prop/store value. In short: a read-only derived value is a `computed`; form state initialized from a prop/store initializes the `ref` directly (`watchImmediate` to set an initial value is always a smell) and resyncs via `useCloned`, never a hand-written mirror; a reset-on-open watch is only justified when the data can change externally; an id the instance is keyed by cannot change, so read it once in `onMounted` (or `await` at setup inside `<Suspense>`). Watching is correct for bridging imperative APIs (Phaser, Tiptap, Desmos) and for async side effects of state that genuinely varies under a live instance.

- Prefer `watchDeep(source, cb)` over `watch(source, cb, { deep: true })` and `watchImmediate(source, cb)` over `{ immediate: true }`. When both are needed: `watchDeep(source, cb, { immediate: true })` (alphabetical: deep before immediate).
- **Never `watchEffect`** — always `watch` with explicit dependencies; implicit tracking is hard to audit and re-runs on unrelated changes. Wrap a prop dependency in a getter: `watch(() => isActive, ...)`.

## Vue Hooks

- Place `watch`, `onMounted`, `onUnmounted` and other lifecycle hooks/watchers at the **bottom** of `<script setup>`, after all `const` assignments, with a blank line before them.
- **Prefer no hook at all** — exhaust the watch decision tree first. A `watchEffect` that merely copies a store value into a local `ref` is almost always replaceable by the wrapper + pure-child pattern (`vue-component-patterns` skill): guard the source with `v-if` in the parent, pass it as a required prop, init the child's `ref` from that prop.
- **Blank line between each consecutive hook/watcher** — each is an independent registration. This overrides the `formatting` skill's "no blank line before a block that immediately follows another block".
- **Order by lifecycle phase** — `watch`/`watchEffect`, then `onMounted`, then `onUnmounted` (setup-time registrations precede mount-time, which precede teardown). Within a phase keep source order.
- Always wrap the callback in an explicit arrow function — never pass a function reference directly (avoids scope/binding issues and argument forwarding): `onUnmounted(() => { reset(); })`, not `onUnmounted(reset)`. Applies everywhere — `.map()`, `.filter()`, lifecycle hooks, JS event listeners: `array.map((item) => fn(item))`. (Template `@event` bindings use `@click="fn()"` — see Template Conventions.)

## Browser Globals and SSR

- **Prefix browser-only globals with `window.`** to make browser-only code explicit: `window.document.getElementById(id)`, `window.navigator.mediaDevices.getUserMedia(...)`, `new window.RTCPeerConnection(...)`, `window.requestAnimationFrame(cb)`. Standard built-ins available in all environments (`Uint8Array`, `Map`, `Set`, `JSON`, `Promise`, `crypto`, …) do **not** need it.
- **Guard browser-only code with `getIsServer()`** from `@esposter/shared` — never `import.meta.client` or `typeof window !== "undefined"`; `getIsServer()` is consistent across Nuxt, shared packages and Azure Functions.

  ```typescript
  if (!getIsServer()) { ... }

  useScript<typeof Desmos>(API_URL, {
    use: () => (getIsServer() ? undefined : window.Desmos) as typeof Desmos,
  });
  ```

## After Finishing Code Changes

1. Run `pnpm format` from the **repo root** — formats all packages (~1.6s, oxfmt).
2. Run `pnpm typecheck` in `packages/app` as a background task — too long to block on; the user reviews when ready.
