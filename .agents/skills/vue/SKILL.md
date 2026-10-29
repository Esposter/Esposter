---
name: vue
description: Apply when writing or reviewing .vue files, or rendering a date or time. Esposter's Vue 3 single-file-component conventions.
---

# Vue Conventions

- `<script setup lang="ts">` at the top of every SFC. Prefer attributify over `<style>` blocks; when a block is genuinely needed, the `styling` skill owns its rules (`scoped`, library CSS).
- Self-closing tags for empty components/elements: `<Component />`.
- Blank-line placement (templates, consts, returns, blocks) and comment attachment — the `formatting` skill ("Blank Lines", `references/comment-placement.md`).
- Links, `:to`, `navigateTo`, reactive route reads, route validation, page keys and route-synced tabs — see the `routing` skill.
- Composables under `app/composables/`, and Vue's and Pinia's own primitives (`ref`, `computed`, `watch`, `storeToRefs`), are auto-imported and never imported by hand; services, models and stores still are.

## Settled — do not re-propose

- **A lint rule for computed extraction** — oxlint cannot resolve a template identifier back to its script declaration (the SFC's halves are separate ASTs to it), and neither half of the rule is syntactic, since "walks a collection" and "is bound to a prop" both need the other side of the boundary.

## Ordering — `references/ordering.md`

Macros `defineSlots` → `defineModel` → `defineProps` → `defineEmits`, then every `const`, `defineExpose` last; declarations run page metadata → macros → framework value composables → Pinia stores → everything else; attributes run `v-model`/`v-for` → `class` → attributify → valued props (alphabetical) → bare booleans → `@event`. The exceptions to each, and the typing `defineModel` and `defineSlots` take, are that page.

## Single-use functions must be inlined — `references/inline-handlers.md`

Read it when naming, extracting or reviewing a function used once. **A single-use function that only defers a block must be inlined**; the discriminator is whether its name states its _trigger_ (`onMount`, `handleX` — inline it, including template handlers however long) or its _result_ (`getFooType` — keep it, single use is fine). The page owns every form of ceremony, the template-scope exception, and the list of legitimate keeps.

- **Prefer `useEventListener` over manual `addEventListener`/`removeEventListener`** — it auto-removes on unmount, so the handler can be inlined; the target and SSR rules are on that page.
- **Never destructure event parameters** (`no-restricted-syntax`, for a DOM `*Event` annotation or a listener API's callback) — destructured methods (`preventDefault`, …) lose their `this` and throw "Illegal invocation". A template `@event` arrow is out of the selector's reach, since a component's payload is not an event: keep the full `event` there by reading.

## v-model, Inputs and Forms — `references/forms.md`

Read it when an input needs the split `:model-value` + `@update:model-value` form, or when a form handles both create and edit (the `isCreate` prop, a single `values` ref).

- Prefer `v-model="ref"` over the split form whenever the update is a direct assignment to a single ref.
- **Never trim in Vue** — `restrictedTrimSyntaxes.js` enforces it, since tRPC input schemas already normalize and a string a component parses belongs in a service. **Trust the server schema** — validity is a `safeParse` of the shared schema driving `:disabled`, and submit handlers pass raw values with no guards. Both rules in full, including what dirty-state comparison parses, are on that page.

## Template Conventions

- **Truthiness** — `v-if="value"`, not `v-if="value !== null"`. Explicit undefined comparisons only when distinguishing falsy values (`0` valid, `false` meaningful).
- **No bare function references in `@event` bindings** (`vue/no-restricted-syntax`) — a bare ref forwards the event object as first arg (almost always unintended). Use `fn()` for zero-arg calls, an arrow function naming the payload when it is wanted: `@select="(id) => selectRole(id)"`.
- **`v-for` destructures what it reads**, keeping the whole item only when it is passed on (`references/template-bindings.md`).
- **Never use `.value` in templates** — Vue auto-unwraps refs, so `ref.value` reads `.value` on the unwrapped object (usually `undefined`). Write `fn(ref)`; `.value` is for `<script setup>` only.
- **No allocating expressions in render positions** — `Object.*` in a `:prop`, `v-for` source or `{{ }}` allocates a fresh reference every render. Enforced by `vue/no-restricted-syntax`, whose message states the fix.
- **Event modifiers over raw event methods** (`vue/no-restricted-syntax`); the exceptions and the one banned call are on `references/template-bindings.md`.
- Reassigning a `defineModel` vs mutating it in place is a deliberate semantic choice — don't "fix" one into the other.
- **`references/template-gotchas.md`** — read it when a directive or slot renders nothing, or vue-tsc cannot see a template identifier: `v-html` on a component, a dotted slot name, a guard that stops narrowing at a closure inside an inline handler, and why a type-only import is enough for a template cast.

## Props, Refs & Computed

- **Props typed from a third-party component carry `// @TODO: https://github.com/vuejs/core/issues/11371`**, one per site (`references/props.md`).
- **`defineProps` takes a locally declared `interface Props`**, never exported (`props-interface` plugin, `references/props.md`).
- **No `provide`/`inject`** (`no-restricted-globals` for the auto-import, `no-restricted-imports` from `vue`) — an injected input is missing from the component's signature, a forgotten provider silently takes the default, and a test must mount the provider. Pass a prop down, or read a Pinia store for state the app shares. A library whose contract is a subtree's context — a theme scope, a renderer's parent container — disables the line with that reason.
- **A local bound to a prop is named after it**, so the `:prop` shorthand works; a module-scope constant is not a local (`references/props.md`).
- **Optional refs omit the initial value** — `ref<T>()`, never an explicit `undefined`; `no-restricted-syntax` enforces it, and a string ref's `""` is the `absent-values` skill (`references/string-sentinel.md`).
- **Template refs use `useTemplateRef`** with no generic and no `Ref` suffix (`template-ref/require-ref-name`), and a Three object the script moves is created there and mounted with `<primitive>` rather than reached through one (`references/template-refs.md`).
- **Sort at display time**, in the computed feeding the template, never in the store (`references/props.md`).
- **A `computed` earns its place by reuse, work or identity, never by use count** — `references/computed-extraction.md`, read before extracting or inlining one; the traps, the keeps and the cadence question are on that page.
- **Map lookups over computed** — when a value depends on an enum/discriminant key, use `Map[type]` directly in the template (`Map[type].value` for multiple properties). Fall back to a computed only when the lookup is duplicated in 2+ places.
- **Writable computed over `watch` + local ref** (`references/watch-decision-tree.md`, case 1).

## Reading the auth session — `references/auth-session.md`

Read it when anything needs the signed-in user. Two call forms, and the access shape follows the form: `await useAuthSession()` in async SSR-relevant context (`session.value?.user.id`), the bare `authClient.useSession()` wherever you can't `await` (`session.value.data?.user.id`).

## When (not) to `watch` — `references/watch-decision-tree.md`

Read it before writing any `watch`, or when a local `ref` mirrors a prop/store value. Reach for a watcher only after the page's cases 1–4 are ruled out.

- **`watchDeep`/`watchImmediate` replace the option object on `watch`** (`no-restricted-syntax`), and **`deep` skips Vue's own changed check**. Why the rule reaches `.ts`, where the aliases do not exist, how both flags compose, and when a deep watcher's re-run is the bug: `references/watch-decision-tree.md` ("Writing the watch").
- **Never `watchEffect`** (`no-restricted-syntax`, its `Post`/`Sync` twins included) — always `watch` with explicit dependencies; implicit tracking is hard to audit and re-runs on unrelated changes. Wrap a prop dependency in a getter: `watch(() => isActive, ...)`.

## Lifecycle hooks and the browser — `references/lifecycle-and-ssr.md`

A browser global read at setup scope runs on the server too, and the failure is a render that never reaches the client. **Placing a lifecycle hook, or touching `window`, `document` or anything else the server does not have**, is that page.

## The Options API runtime is compiled out — `references/options-api.md`

Ours are `<script setup>` only (`vue/component-api-style`). `vue.optionsApi` is **off** and stays off, so a _dependency_ shipping Options API `.vue` components mounts and then dereferences off `undefined` with nothing thrown to name the cause. Every Vitest worker runs the same Vue, so a component test mounting one fails as the app does. Read the page before adding one, or when a `node_modules` component renders blank.

## Dates Are `<NuxtTime>` — `references/dates.md`

Every rendered date is a `<NuxtTime>`; the date-formatting ban inside a `.vue` and the hand-written time element are lint errors (`vue/no-restricted-syntax`, `vue/no-restricted-html-elements`). Standard: `openspec/specs/architecture/date-time-display/design.md`. Read the page for what the lint rule can't say — options rather than format strings, what bare `title` really renders, and the client-rendered message list as the one exception.

## Reference pages

- `references/template-bindings.md` — when writing a `v-for` or an event modifier.
- `references/props.md` — when declaring props, binding a local to a prop, or typing props from a third-party component.
- `references/template-refs.md` — when taking a ref to an element, a child component or a Tres element.
- `references/ordering.md` — when laying out a `<script setup>` block's macros and declarations, or an element's attributes.
- `references/inline-handlers.md` — when naming, extracting or reviewing a function used once.
- `references/forms.md` — when an input needs the split binding, or a form handles both create and edit.
- `references/template-gotchas.md` — when a directive or slot renders nothing, or vue-tsc cannot see a template identifier.
- `references/computed-extraction.md` — before extracting or inlining any `computed`.
- `references/auth-session.md` — when anything needs the signed-in user.
- `references/watch-decision-tree.md` — before writing any `watch`, or when a local `ref` mirrors a prop or store value.
- `references/lifecycle-and-ssr.md` — when placing a lifecycle hook, or touching a browser global.
- `references/options-api.md` — before adding a dependency that ships `.vue` components, or when one renders blank.
- `references/dates.md` — when rendering a date or time in a `.vue` file.
