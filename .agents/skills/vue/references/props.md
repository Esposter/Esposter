# Props

Read when declaring a component's props, binding a local to a prop, or typing props from a third-party component. The one-line rules are in `SKILL.md`; this page is their full statement.

- **A component typing its `Props` from a third-party component's props — a vue-flow node's `GraphNode` fields — carries `// @TODO: https://github.com/vuejs/core/issues/11371` on its own `Props`, deliberately per site** — the compiler cannot resolve that conditional type yet, and the marker is where each site gets simplified in place the day it can. It is one comment repeated on purpose, not a duplicate to collapse.

- **`defineProps` takes a locally declared `interface Props`** — the file path already spells the component, so the name carries none of it, and there is nothing left to decide per folder. The `props-interface` oxlint plugin enforces the name and the inline-object-literal ban.
  - **A shape another file reads is not exported from the SFC** — it moves to its own `.ts` beside the component that owns it (`RichTextEditor/FooterBar.vue` → `RichTextEditor/FooterBarSlotProps.ts`), named after its single export the way any other module is, and the component imports it back. A props shape shared outside its own subtree is a sign the shape belongs to a model rather than to a component. `props-interface/no-exported-type` enforces the export half; where the file lands is yours.

- **Prop shorthand naming** — when binding a simple local `ref`/`computed` directly to a prop, name it to match that prop so the `:prop` shorthand works (`const fooType = ref(...)` → `:fooType`). Doesn't apply to complex expressions (`:src="session.user.image"`) or named `defineModel` variables. **A module-scope constant is not a local**, so it keeps the constant casing and the bind is written out (`:items="PIN_ITEMS"`, `:button-props="DELETE_BUTTON_PROPS"`) — the casing is what says the value is fixed for the life of the process, which is worth more at the use site than the shorthand is.

## Sorting

- **Sort at display time** — apply `.toSorted()` in the `computed` that feeds the template; never in store ingestion (`readX`, `setX`, mutation helpers). Stores hold natural order; components transform for display. **Exception**: sort before the API call when sorted order is sent to the backend (message pagination cursors).
