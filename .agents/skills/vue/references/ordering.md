# Ordering inside an SFC

Read when laying out a `<script setup>` block — the macros, then the declarations — or the attributes on one element. `SKILL.md` keeps the one-line order of each; this page is the full order with its exceptions.

## Macros

`defineSlots` → `defineModel` → `defineProps` → `defineEmits`, then all `const` assignments, then `defineExpose` last (preceded by a blank line, before any `watch`/lifecycle hooks).

- **`defineModel`**: always type explicitly, and for booleans pass `{ default: false }` so the type excludes `undefined`. Never declare one unless the value is used in script (`watch`, `computed`, or passed) — otherwise use `:prop` + `@event`. An **unnamed** model's variable is `modelValue`, never `model` or another alias; a **named** model's variable matches the name (`const title = defineModel<string>("title")`).
- **`defineSlots`**: only assign to `const slots` when `slots` is referenced in script. Otherwise call `defineSlots<...>()` without assignment.

## Script setup declarations

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

## Template attributes

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
