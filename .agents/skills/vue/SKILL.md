---
name: vue
description: Esposter Vue 3 SFC conventions — macro ordering, script-setup declaration order, template attribute ordering and template conventions, inlining single-use functions and handlers, v-model vs split bindings, never normalizeString in Vue, optional refs, useTemplateRef, computed by cost, identity and cadence, map lookups, the watch decision tree plus watch aliases, and every rendered date being a NuxtTime — plus deep dives on lifecycle-hook placement with browser globals via window. and SSR guards via checkIsServer, inline handlers, forms and upsert mode, the auth session, computed extraction, template gotchas (v-html, dotted slots, closure narrowing, template casts), the compiled-out Options API runtime, and date rendering. Apply when writing or reviewing .vue files, or rendering a date or time.
---

# Vue Conventions

- `<script setup lang="ts">` at the top of every SFC. Prefer attributify over `<style>` blocks; when a block is genuinely needed, the `styling` skill owns its rules (`scoped`, `lang="scss"`, library CSS).
- Self-closing tags for empty components/elements: `<Component />`.
- Blank-line placement (templates, consts, returns, blocks) and comment attachment — see the `formatting` skill.
- Links, `:to`, `navigateTo`, reactive route reads, route validation, page keys and route-synced tabs — see the `routing` skill. All Vuetify-specific conventions — see the `vuetify` skill.

## Vue Macro Ordering

`defineSlots` → `defineModel` → `defineProps` → `defineEmits`, then all `const` assignments, then `defineExpose` last (preceded by a blank line, before any `watch`/lifecycle hooks).

- **`defineModel`**: always type explicitly, and for booleans pass `{ default: false }` so the type excludes `undefined`. Never declare one unless the value is used in script (`watch`, `computed`, or passed) — otherwise use `:prop` + `@event`. An **unnamed** model's variable is `modelValue`, never `model` or another alias; a **named** model's variable matches the name (`const title = defineModel<string>("title")`).
- **`defineSlots`**: only assign to `const slots` when `slots` is referenced in script. Otherwise call `defineSlots<...>()` without assignment.

## Script Setup Declaration Order

0. **Page-metadata side-effects** — `useHead`, `useSeoMeta` near the **top**, above the macros when they depend on no local state; one reading reactive state sits just after that state, still above unrelated logic.
1. **Macros** — see above. No blank line between the macros and the declarations that follow.
2. **Framework / third-party value composables** — `useNuxtApp`, `useRoute`, `useRouter`, `useRuntimeConfig`, VueUse value composables (`useVDisplay`, `useWindowSize`, …), auth (`authClient.useSession`). Grouped immediately after the macros.
3. **Custom Pinia stores** — `useXStore` + `storeToRefs` + destructured methods; the per-store grouping order is the `pinia` skill's.
4. **Custom composables, refs, computeds, watches, functions** — everything else.

```ts
useHead({ titleTemplate: ... });       // 0. static page metadata — top, may precede macros
defineSlots<{ default: () => VNode }>();
const { $trpc } = useNuxtApp();        // 2. third-party
const fooStore = useFooStore();        // 3. custom store
const { currentFoo } = storeToRefs(fooStore);
const fooName = useFooName(...);       // 4. custom composable / state
```

Never leave a framework value composable stranded at the bottom below custom stores and refs. **Exceptions that stay in category 4:** `useTemplateRef` (a ref — group with refs), and side-effect registrations that depend on local state (`useEventListener`, a `useSeoMeta` reading store refs) which must stay after the state they depend on.

## Single-use functions must be inlined — `references/inline-handlers.md`

Read it when naming, extracting or reviewing a function used once. **A single-use function that only defers a block must be inlined**; the discriminator is whether its name states its _trigger_ (`onMount`, `handleX` — inline it, including template handlers however long) or its _result_ (`getFooType` — keep it, single use is fine). The page owns every form of ceremony, the template-scope exception, and the list of legitimate keeps.

- **Prefer `useEventListener` over manual `addEventListener`/`removeEventListener`** — it auto-removes on unmount, so the handler can be inlined; the target and SSR rules are on that page.
- **Never destructure event parameters** — `(event: KeyboardEvent) => { event.key ... }`, not `({ key })`. Destructuring event methods (`preventDefault`, …) causes "Illegal invocation" via lost `this` binding. Keep the full `event` object even when only reading properties.

## v-model, Inputs and Forms — `references/forms.md`

Read it when an input needs the split `:model-value` + `@update:model-value` form, or when a form handles both create and edit (the `isCreate` prop, a single `values` ref).

- Prefer `v-model="ref"` over the split form whenever the update is a direct assignment to a single ref.
- **Never apply `normalizeString` (or any trimming) anywhere in Vue**, and **trust the server schema** — tRPC input schemas already normalize, validity is a `safeParse` of the shared schema driving `:disabled`, and submit handlers pass raw values with no guards. Both rules in full, including what dirty-state comparison parses, are on that page.

## Template Attribute Ordering

1. **`v-model`** (or **`v-for`** + **`:key`**) — binding/iteration directives first
2. **`class`** — static class string
3. **UnoCSS attributify props** — shorthand utilities as props (`ma-2`, `flex`, `flex-col`)
4. **Component props with values** — `:prop="value"` / `prop="string"` (alphabetical)
5. **Shorthand boolean props** — bare names defaulting to `true` (`clearable`, `autofocus`)
6. **Event handlers** — `@event="..."` last

```vue
<v-text-field
  v-model="search"
  ma-2
  density="compact"
  label="Search"
  autofocus
  clearable
  @keydown.enter.stop="submit()"
/>
```

## Template Conventions

- **Truthiness** — `v-if="value"`, not `v-if="value !== null"`. Explicit null/undefined comparisons only when distinguishing falsy values (`0` valid, `false` meaningful, `null` vs `undefined` matters).
- **No bare function references in `@event` bindings** — a bare ref forwards the event object as first arg (almost always unintended). Use `fn()` for zero-arg calls, an arrow function when args are needed: `@complete="(a, b) => useFoo(a, b)"`.
- **`v-for` destructuring** — destructure when properties are accessed (`v-for="{ value, icon, title } of items"`); keep a full reference only when the whole object is needed (passed as prop or stored), naming the loop var to match the target prop for `:propName` shorthand.
- **`v-bind` shorthand** — the `:` forms (including `:="object"` and same-name `:prop`) are autofixed by `vue/v-bind-style` with `sameNameShorthand: "always"` (`packages/configuration/eslint/overrides/vueRules.js`); `pnpm lint:fix` settles it.
- **Never use `.value` in templates** — Vue auto-unwraps refs, so `ref.value` reads `.value` on the unwrapped object (usually `undefined`). Write `fn(ref)`; `.value` is for `<script setup>` only.
- **No allocating expressions in render positions** — `Object.*` in a `:prop`, `v-for` source or `{{ }}` allocates a fresh reference every render. Enforced by `vue/no-restricted-syntax`, whose message states the fix.
- **Event modifiers over raw event methods** — `@click.stop`, `@keydown.enter.prevent` (`vue/no-restricted-syntax`). Raw calls stay correct where no modifier can encode the trigger: behind a runtime guard, and in programmatic listeners (`useEventListener`, `onKeyStroke`, Tiptap `onKeyDown`). `stopImmediatePropagation()` is banned outright — it couples behaviour to listener registration order.
- Reassigning a `defineModel` vs mutating it in place is a deliberate semantic choice — don't "fix" one into the other.
- **`references/template-gotchas.md`** — read it when a directive or slot renders nothing, or vue-tsc cannot see a template identifier: `v-html` on a component, a dotted slot name, a guard that stops narrowing at a closure inside an inline handler, and why a type-only import is enough for a template cast.

## Props, Refs & Computed

- **`defineProps` takes a named `interface <ComponentName>Props`** — never an inline object-literal type or a plain `interface Props`. Name it after the component's identity (file/folder name, stripping `Index`): `Foo/Index.vue` → `FooProps`; `Foo/BarItem.vue` → `BarItemProps`.
  - **How many path words that is, is settled by the folder rather than re-argued per file**: the siblings already spell it, so match them and the tree stays readable — the full auto-import path (`MessageModelMessageTypeTrailingProps`) and the bare file word where every neighbour carries the folder (`ContainerProps` beside `ForwardSendButtonProps`) are both outliers to fix, while a categorisation folder the siblings drop (`Type/Poll.vue` → `PollProps`) stays dropped. What is never a judgement call: **two different shapes may not share one name** — `OptionsMenu/Index.vue` and `OptionsMenu/More.vue` both writing `MessageOptionsMenuProps` is a defect however the words are counted.
- **Prop shorthand naming** — when binding a simple local `ref`/`computed` directly to a prop, name it to match that prop so the `:prop` shorthand works (`const fooType = ref(...)` → `:fooType`). Doesn't apply to complex expressions (`:src="session.user.image"`) or named `defineModel` variables.
- **Optional refs omit the initial value** — `ref<string>()` infers `Ref<string | undefined>`; never `ref<string | undefined>(undefined)`.
- **Template refs always use `useTemplateRef`** — no generic (Vue 3.5+ infers from the template), no `Ref` suffix, name matching the `ref="..."` value (`const video = useTemplateRef("video")`). Drop any component type imported only for the generic. A generic is justified only where inference falls short: the element doesn't expose the property you want, or the inferred union is too complex to work with.
- **Sort at display time** — apply `.toSorted()` in the `computed` that feeds the template; never in store ingestion (`readX`, `setX`, mutation helpers). Stores hold natural order; components transform for display. **Exception**: sort before the API call when sorted order is sent to the backend (message pagination cursors).
- **Computed by cost and identity, never by use count — `references/computed-extraction.md`** — read it before extracting or inlining any `computed`. A computed is a cache with a price, so it earns its place on **reuse** (binds to 2+ props), **work** (parses, formats, filters, maps, sorts, reduces, walks a collection), or **identity** (allocates an object/array/function bound to a prop). Everything else inlines: comparisons, booleans, ternaries, template literals, property reads, arithmetic, map lookups. The page owns the traps, the keeps that override cost, and the cadence question — work run per event that only changes per boundary.
- **Map lookups over computed** — when a value depends on an enum/discriminant key, use `Map[type]` directly in the template (`Map[type].value` for multiple properties). Fall back to a computed only when the lookup is duplicated in 2+ places.
- **Writable computed over `watch` + local ref** — when a local value is entirely derived from and writes back to a store value, replace the `ref` + `watch` with a `computed({ get, set })`.

## Reading the auth session — `references/auth-session.md`

Read it when anything needs the signed-in user. Two call forms, and the access shape follows the form: `await authClient.useSession(useFetch)` in async SSR-relevant context (`session.value?.user.id`), the bare `authClient.useSession()` wherever you can't `await` (`session.value.data?.user.id`).

## When (not) to `watch` — `references/watch-decision-tree.md`

Read it before writing any `watch`, or when a local `ref` mirrors a prop/store value. In short: a read-only derived value is a `computed`; form state initialized from a prop/store initializes the `ref` directly (`watchImmediate` to set an initial value is always a smell) and resyncs via `useCloned`; an id the instance is keyed by cannot change, so read it once in `onMounted`. Watching is correct for bridging imperative APIs (Phaser, Tiptap, Desmos) and for async side effects of state that genuinely varies under a live instance.

- Prefer `watchDeep(source, cb)` over `watch(source, cb, { deep: true })` and `watchImmediate(source, cb)` over `{ immediate: true }`. When both are needed: `watchDeep(source, cb, { immediate: true })` (alphabetical: deep before immediate). Both aliases are VueUse via Nuxt auto-imports, so they exist in `packages/app` only — a published package taking on VueUse for an alias would push that dependency onto every consumer, so the option object stays there.
- **Never `watchEffect`** — always `watch` with explicit dependencies; implicit tracking is hard to audit and re-runs on unrelated changes. Wrap a prop dependency in a getter: `watch(() => isActive, ...)`.

## Lifecycle hooks and the browser — `references/lifecycle-and-ssr.md`

A browser global read at setup scope runs on the server too, and the failure is a render that never reaches the client. **Placing a lifecycle hook, or touching `window`, `document` or anything else the server does not have**, is that page.

## The Options API runtime is compiled out — `references/options-api.md`

Ours are `<script setup>` only (`vue/component-api-style`, which bans plain `defineComponent(…)` with it). `vue.optionsApi` is **off** and stays off, so a _dependency_ shipping Options API `.vue` components mounts and then dereferences off `undefined` with nothing thrown to name the cause. Read the page before adding one, or when a `node_modules` component renders blank — it also covers why a component test of it still passes.

## Dates Are `<NuxtTime>` — `references/dates.md`

Every rendered date is a `<NuxtTime>`; `formatDate(…)`, `toLocaleDateString()`, `useTimeAgo` and `useDateFormat` inside a `.vue` are `vue/no-restricted-syntax` errors, and a hand-written `<time>` is a `vue/no-restricted-html-elements` one. Standard: `packages/app/content/docs/architecture/date-time-display.md`. Read the page for what the lint rule can't say — options rather than format strings, what bare `title` really renders, and the client-rendered message list as the one exception.
