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
- Remove comments — make variable names descriptive instead. When comments are necessary, no blank line before or after the comment — attach it directly to the code it describes.
- Minimise blank lines; group related code tightly.
- **Blank line after a closing `}`** of an `if`, `for`, or other block statement — unless it is the last statement in its scope or is immediately followed by another opening block.

## Vue Macro Ordering

`defineSlots` → `defineModel` → `defineProps` → `defineEmits` (in this order), then all `const` assignments, then `defineExpose` last (preceded by a blank line, before any `watch`/lifecycle hooks).

## Props Interface Naming

- Always use `interface {ComponentName}Props` (e.g. `interface DialogProps`, `interface EditDialogButtonProps`)
- Always call `defineProps<{ComponentName}Props>()`

## Inline Functions & Macros

- **Inline arrow functions** where argument types can be inferred from context — don't extract single-use, trivially-typed lambdas into named functions.
- **Inline Vue event handlers** — always write handlers directly in the template (`@submit="async (_, onComplete) => { ... }"`). This lets Vue infer event argument types automatically. Only extract to a named function if the same logic is reused in multiple places (e.g. called from both a button click AND a keydown handler). Single-use handlers must always be inlined, no exceptions.
- **IME composition guard** — when handling `@keydown.enter` on text inputs, guard inline against IME composition so that confirming a CJK candidate doesn't prematurely commit: `@keydown.enter.stop="!$event.isComposing && commitEdit()"`.
- **`defineModel`**: always type explicitly. For booleans, you must pass `{ default: false }` so the type does not implicitly include `undefined` (`defineModel<boolean>({ default: false })`).
- **`defineSlots`**: only assign to a variable when `slots` is actually referenced in script — `const slots = defineSlots<{ ... }>()`. If `slots` is not used in script (e.g. the template uses `<slot>` tags directly), call `defineSlots<...>()` without assignment.
- **No abbreviated parameter names** — use full descriptive names (e.g. `event` not `e`, `column` not `col`, `configuration` not `config`, `dataSource` not `source`, `relativePosition` not `relPos`, `position` not `pos`, `previous` not `prev`). Exception: simple iteration callbacks where the meaning is obvious from context (e.g. `.filter((row, index) => ...)`).
- **No abbreviated function names** — use full descriptive names (e.g. `goToPrevious` not `goToPrev`, `initialize` not `init`, `calculate` not `calc`).
- **`onUpdate:*` handler parameters** — always name the parameter `new{PropName}` in camelCase: `'onUpdate:itemsPerPage': (newItemsPerPage) => { ... }`, `'onUpdate:page': (newPage) => { ... }`, `'onUpdate:modelValue': (newModelValue) => { ... }`.
- **Never destructure event parameters** — always use `(event: KeyboardEvent) => { event.key ... }` not `({ key }: KeyboardEvent) => { key ... }`. Destructuring event methods (e.g. `preventDefault`, `stopPropagation`) causes "Illegal invocation" because they lose their `this` binding. Keep the full `event` object for consistency even when only accessing properties.
- **`@click` shorthands** — if a click handler is a single async call, use `@click="myAsyncFn(args)"` directly — no need to wrap in `async () => { await myAsyncFn(args) }`.
- **Never declare `defineModel` unless the value is actually used** in script (e.g. in a `watch`, `computed`, or passed somewhere). Don't create a model just to forward it — use `:prop` + `@event` instead.

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

- **No bare function references in `@event` bindings** — always wrap in an explicit arrow function: `@complete="(scene, tilemap) => useCreateTilemapAssets(scene, tilemap)"` not `@complete="useCreateTilemapAssets"`. Bare references cause accidental argument forwarding (extra Vue-internal args get passed). This mirrors the TypeScript rule: never pass a naked function reference.
- **`v-for` destructuring** — always destructure `v-for` bindings when properties are accessed in the template: `v-for="{ value, icon, title } of items"` not `v-for="item of items"` + `item.value`. Only keep a full reference when the whole object is needed (e.g. passed as a prop or stored in a ref). In that case, name the loop variable to match the prop it will be passed to, enabling `:propName` shorthand.
- **Prop shorthand naming** — name local variables to match their target prop so Vue's `:propName` shorthand works without explicit assignment. For example, if the prop is `dataSourceType`, the local variable must also be `dataSourceType`.
- **`#activator` always first** — in components that use both `#activator` and other slots (e.g. `v-tooltip`, `v-menu`), always place the `#activator` template as the first child.
- **Slot names with dots always use dynamic binding** — Vue does not support dots in static slot names, so Vuetify item slots always require the bracket syntax: `#[`item.drag`]`, `#[`item.actions`]`. Only plain names without dots can be static (e.g. `#top`, `#activator`).
- **Always use `:` shorthand** instead of `v-bind:propName` — write `:disabled="..."` not `v-bind:disabled="..."`. The object-spread form `v-bind="object"` has no shorthand and stays as-is.
- **Never use `.value` in templates** — Vue auto-unwraps refs in template expressions. Writing `ref.value` in a template accesses `.value` on the already-unwrapped object (not on the ref), which is almost always `undefined`. Write `fn(ref)` not `fn(ref.value)`. `.value` is only needed in `<script setup>` (outside template expressions).

## Refs & Computed

- **Template refs** — always use `useTemplateRef` for both component and HTML element refs. Never suffix the variable with `Ref` — `const errorIcon = useTemplateRef(...)` not `const errorIconRef = useTemplateRef(...)`.
  - Components: `useTemplateRef<InstanceType<typeof ComponentName>>("name")`
  - HTML elements: `useTemplateRef("container")` — no explicit type annotation needed, Vue infers it. Use a generic semantic name like `"container"`, never the element tag name (not `"spanRef"`, not `"divRef"`).
- **Boolean computed naming** — use `is*` prefix for boolean computed refs (e.g., `isUndoable`, `isRedoable`, `isSavable`). Do not use `can*`.
- **Computed for reused expressions** — extract a `computed` (named to match the prop, e.g. `title`) when the same derived value is bound to two or more props. This enables the `:propName` shorthand for one binding and avoids repeating the expression: `const title = computed(() => ...)` → `:title :tooltip-text="title"`. No need for a computed if the value is only used in one place.
- **Inline prop values** — inline prop values directly in the template to take advantage of Vue TypeScript inference. Only extract to a `computed` when the same logic is reused in multiple places. Single-use derived values stay inline.
- **Map lookups over computed** — when a value depends on an enum/discriminant key, use a `Map[type]` lookup directly in the template instead of a computed. If multiple properties are needed from the same map entry, use `Map[type].value`. Only fall back to computed when the same map lookup is duplicated in two or more places.

## Conditional Logic

When branching on a type/discriminant, use in this priority order:

1. **Map lookup** — `Map[type]` inline in template (preferred)
2. **`switch` expression** — use a `switch` in script when a map is impractical
3. **`if / else if / else`** — explicit branches for complex conditions
4. **Never** chain standalone `if` statements for mutually exclusive conditions. Always use `else if` / `else` or a `switch`.

## After Finishing Code Changes

1. Run `pnpm format` from the **repo root** — formats all packages at once (~1.6s, oxfmt).
2. Run `pnpm typecheck` in `packages/app` as a background task — takes too long to block on. The user reviews results when ready.

## Watch Aliases

Prefer `watchDeep(source, cb)` over `watch(source, cb, { deep: true })` and `watchImmediate(source, cb)` over `watch(source, cb, { immediate: true })`. When both flags are needed, use `watchDeep(source, cb, { immediate: true })` (alphabetical: deep before immediate).

## Vue Hooks

- Always place `watch`, `onMounted`, `onUnmounted`, and other Vue lifecycle hooks/watchers at the **bottom** of `<script setup>`, after all `const` assignments.
- Always put a blank line before them to visually separate them from regular `const` assignments.
- Always wrap the callback in an explicit arrow function — never pass a function reference directly. This avoids scope/binding issues and prevents accidental argument forwarding: `onUnmounted(() => { reset(); })` not `onUnmounted(reset)`.
- This applies everywhere — `.map()`, `.filter()`, event handlers, lifecycle hooks, etc. Always use `array.map((item) => fn(item))` not `array.map(fn)`.

## Vuetify

See the **vuetify** skill for all Vuetify-specific conventions.
