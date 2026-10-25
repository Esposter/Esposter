# CSS custom properties for component styles

Read when a component genuinely needs a `<style>` block (`:deep()`, `@keyframes`, element selectors) and a shared value inside it. A preprocessor variable is banned there — it is a build-time value needing `additionalData` injection — and these are the `:root` properties in `apps/web/app/assets/css/globals.css` to use instead.

The shared properties are the `:root` block in `apps/web/app/assets/css/globals.css`, and they are deliberately not restated here: a copy of the list in prose goes stale the moment that block moves, and the values are not even all one kind — a length beside a duration beside a colour. Read the block for the name a style needs, including the ApexCharts tokens.

The goal is always attributify — a scoped class that only restates utilities is still wrong, even with the right variables:

```vue
<!-- WRONG — preprocessor variable, requires additionalData injection -->
<style scoped>
.panel {
  border: $border-width-root $border-style-root v-bind(border);
  bottom: $dock-inset-block-end;
}
</style>
<!-- ALSO WRONG — scoped CSS class when attributify can do this directly -->
<style scoped>
.panel {
  padding: var(--ui-step);
  bottom: var(--dock-inset-block-end);
}
</style>
<!-- CORRECT — attributify; no style block needed -->
<div b-1 b-border bottom="[var(--dock-inset-block-end)]" />
```
