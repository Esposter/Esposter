# Links

Read when adding a link — internal, external, in-page — or a control that goes somewhere.

Declarative links use a Nuxt-native link component or a component's `:to` prop — a plain destination keeps real anchor semantics (cmd/ctrl/middle-click opens a new tab).

- Internal: `<NuxtLink :to>`, or `<NuxtInvisibleLink :to>` when the link should inherit surrounding styling.
- External: `<NuxtLink :to external target="_blank">`.
- In-page anchor: `<NuxtInvisibleLink :to="{ hash }">` (a `NuxtLink` clone that strips default link styling).
- A link-styled control with no destination is a native `<button type="button">` in the link colour, never an anchor or a span (the `styling` skill, `references/links.md`).
- `UiButtonLink`, `UiTabLinks` and a `UiList` row with a plain destination take `:to` directly — an icon that goes somewhere is a `UiButtonLink` inside a `UiTooltip`, as `apps/web/app/components/Resource/CloseButton.vue` is, since `UiIconButton` is a button. Reserve `@click="navigateTo(...)"` for actions that run logic before navigating or compute the target at click time. Route targets still come from `RoutePath`, never string-built.

The raw-`<a>` ban is enforced by `packages/configuration/eslint/overrides/vueRules.js` via `vue/no-restricted-html-elements`. Full standard: `apps/web/content/docs/architecture/navigation.md`.
