# Page Decomposition

Read when a page holds state, a handler or a constant array, or when a bound configuration literal tempts an extraction.

Pages (`pages/**/*.vue`) are **presentation-only orchestrators**: layout structure, `<Head>`, `definePageMeta`/`defineRouteRules`, and composed sub-components. All action logic, validation, and the state an interactive element owns live in the sub-components or composables they belong to; route-derived state and `<Head>` values may stay on the page.

**Rule:** if a page contains a `ref`, `computed`, or named function belonging to a single interactive element (a button, a form), extract that element into its own component. The page's `<script setup>` should read like a bill of materials — imports and metadata, nothing else.

- **Button components** — own the async action, its pending state (the mutation's `isPending`, bound through `is-pending`) and navigation. Template is just `UiTooltip` + `UiIconButton` (or `UiButton`).
- **Form components** — own their field refs, validation computeds, and submit handler. Template is the `UiForm` block.
- **Constant arrays** (feature lists, nav items) — live in `services/<domain>/`, never inline in the page, and are rendered with `v-for` (`<FooFeatureCard v-for="feature of FooFeatures" :key="feature.title" :="feature" />`).
- **A bound configuration literal is not one of them.** The array rule is about **reuse and iteration** — the array exists so a `v-for` can render it and so other pages can import it. A one-off `:configuration` object passed to a single component is neither, and moving it to `services/` only trades an inline literal for an import plus a file, leaving the reader two places to look at where the configured component is. Length is not the trigger and neither is looking like a constant: extract when the value is shared, iterated, or gains a type that catches an error class it cannot catch inline. Otherwise it stays where it is bound.
