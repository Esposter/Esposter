---
paths:
  - "**/*.vue"
  - "**/composables/**/*.ts"
---

# Vue Conventions

## SFC Structure & Formatting

- `<script setup lang="ts">` at the top of every SFC.
- Always use `lang="scss"` in Vue `<style>` blocks.
- Use self-closing tags for components/elements without content: `<Component />`.
- No blank lines within Vue templates.
- No blank lines between `const` assignments — group them tightly together.
- No blank line before `return` when it immediately follows a `const` assignment in a small function.
- Remove comments — make variable names descriptive instead.
- Minimise blank lines; group related code tightly.
- **Blank line after a closing `}`** of an `if`, `for`, or other block statement — unless it is the last statement in its scope or is immediately followed by another opening block.

## Vue Macro Ordering

`defineSlots` → `defineModel` → `defineProps` → `defineEmits` (in this order), then all `const` assignments, then `defineExpose` last (preceded by a blank line, before any `watch`/lifecycle hooks).

## Props Interface Naming

- Always use `interface {ComponentName}Props` (e.g. `interface DialogProps`, `interface EditDialogButtonProps`)
- Always call `defineProps<{ComponentName}Props>()`

## Inline Functions & Macros

- **Inline arrow functions** where argument types can be inferred from context — don't extract single-use, trivially-typed lambdas into named functions.
- **Inline Vue event handlers** — always write handlers directly in the template (`@submit="async (_, onComplete) => { ... }"`). This lets Vue infer event argument types automatically. Only extract to a named function if the same logic is reused in multiple places.
- **`defineModel`**: always type explicitly. For booleans, you must pass `{ default: false }` so the type does not implicitly include `undefined` (`defineModel<boolean>({ default: false })`).
- **`defineSlots`**: only assign to a variable when `slots` is actually referenced in script — `const slots = defineSlots<{ ... }>()`. If `slots` is not used in script (e.g. the template uses `<slot>` tags directly), call `defineSlots<...>()` without assignment.
- **No abbreviated parameter names** — use full descriptive names (e.g. `event` not `e`, `column` not `col`, `configuration` not `config`, `dataSource` not `source`). Exception: simple iteration callbacks where the meaning is obvious from context (e.g. `.filter((row, index) => ...)`).
- **Destructure event parameters** — when only specific properties of an event are needed, destructure them directly in the parameter list instead of accessing via `event.property` repeatedly: `({ ctrlKey, metaKey, preventDefault }) => { ... }` not `(event) => { event.ctrlKey ... }`.
- **`@click` shorthands** — if a click handler is a single async call, use `@click="myAsyncFn(args)"` directly — no need to wrap in `async () => { await myAsyncFn(args) }`.
- **Never declare `defineModel` unless the value is actually used** in script (e.g. in a `watch`, `computed`, or passed somewhere). Don't create a model just to forward it — use `:prop` + `@event` instead.

## Template Conventions

- **`v-for` destructuring** — always destructure `v-for` bindings when properties are accessed in the template: `v-for="{ value, icon, title } of items"` not `v-for="item of items"` + `item.value`. Only keep a full reference when the whole object is needed (e.g. passed as a prop or stored in a ref). In that case, name the loop variable to match the prop it will be passed to, enabling `:propName` shorthand.
- **Prop shorthand naming** — name local variables to match their target prop so Vue's `:propName` shorthand works without explicit assignment. For example, if the prop is `dataSourceType`, the local variable must also be `dataSourceType`.
- **`#activator` always first** — in components that use both `#activator` and other slots (e.g. `v-tooltip`, `v-menu`), always place the `#activator` template as the first child.
- **Always use `:` shorthand** instead of `v-bind:propName` — write `:disabled="..."` not `v-bind:disabled="..."`. The object-spread form `v-bind="object"` has no shorthand and stays as-is.

## Refs & Computed

- **Template refs** — use `useTemplateRef<InstanceType<typeof ComponentName>>("name")`. Never suffix the variable with `Ref` — `const errorIcon = useTemplateRef(...)` not `const errorIconRef = useTemplateRef(...)`.
- **Boolean computed naming** — use `is*` prefix for boolean computed refs (e.g., `isUndoable`, `isRedoable`, `isSavable`). Do not use `can*`.

## Watch Aliases

Prefer `watchDeep(source, cb)` over `watch(source, cb, { deep: true })` and `watchImmediate(source, cb)` over `watch(source, cb, { immediate: true })`. When both flags are needed, use `watchDeep(source, cb, { immediate: true })` (alphabetical: deep before immediate).

## Vue Hooks

- Always place `watch`, `onMounted`, `onUnmounted`, and other Vue lifecycle hooks/watchers at the **bottom** of `<script setup>`, after all `const` assignments.
- Always put a blank line before them to visually separate them from regular `const` assignments.
- Always wrap the callback in an explicit arrow function — never pass a function reference directly. This avoids scope/binding issues and prevents accidental argument forwarding: `onUnmounted(() => { reset(); })` not `onUnmounted(reset)`.
- This applies everywhere — `.map()`, `.filter()`, event handlers, lifecycle hooks, etc. Always use `array.map((item) => fn(item))` not `array.map(fn)`.

## Resource Management

- Always clean up in `onUnmounted`: intervals, timeouts, animation frames, event listeners.
- Prefer `VueUse` composables over manual event listeners where possible.

## Composables

- **Single-function composables return the function directly** — when a composable only exposes one function, return it directly instead of wrapping in an object: `return async (...) => { ... }`. Callers use `const fn = useX()` instead of `const { fn } = useX()`.
- **`Promise.resolve(value)` for sync-to-async** — when a sync expression needs to satisfy a `Promise<T>` return type, use `Promise.resolve(value)` instead of `async () => value`.

## Vuetify Selects

- When building items for `v-autocomplete` / `v-select`, use `SelectItemCategoryDefinition<T>` (`{ title: string, value: T }`) from `@/models/vuetify/SelectItemCategoryDefinition`.
- **Never specify `item-title` or `item-value` props** — Vuetify's defaults are already `"title"` and `"value"`, which match `SelectItemCategoryDefinition` exactly.
- Name the items computed to reflect what the value represents — e.g. `columnIds` for `SelectItemCategoryDefinition<string>[]` where each `value` is a column ID.

## Dialog Form Validity

Always name the form validity ref `isEditFormValid`. Bind it via `v-model` on `<v-form>` and use `ref(true)` for optimistic initial state. Disable Save & Close via `:confirm-button-attrs="{ disabled: !isEditFormValid }"` (combined with other conditions as needed). Never use try/catch in submit handlers — prevent invalid submission through form validation rules so state is always consistent. Use `StyledEditFormDialogErrorIcon` with `:edit-form-ref :is-edit-form-valid` (plus optional `:schema :value` for Zod schema validation) in the `#prepend-actions` slot. `editFormRef` is a required prop typed `InstanceType<typeof VForm> | undefined` (always passed; `| undefined` reflects the ref being uninitialized before mount). `isEditFormValid` is field-level only (from `<v-form v-model>`); schema errors are computed internally inside `StyledEditFormDialogErrorIcon` via `watchDeep` on `value`.

## Keyboard Shortcut Components

When a button has an associated keyboard shortcut, extract it into its own component that owns both the `v-btn` and the `onKeyStroke` handler. This keeps each component focused on one action (e.g., `UndoButton.vue`, `RedoButton.vue`).
