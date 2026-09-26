# CSS custom properties for component styles

Read when a component genuinely needs a `<style>` block (`:deep()`, `@keyframes`, element selectors) and a shared value inside it. A SASS variable is banned there — it is a build-time value needing `additionalData` injection — and these are the `:root` properties in `globals.scss` to use instead.

| Purpose                                | CSS custom property                                           |
| -------------------------------------- | ------------------------------------------------------------- |
| The step every length is a multiple of | `--ui-step`                                                   |
| Room the dock takes from the page      | `--dock-inset-block-end`, `--dock-inset-inline-start`         |
| The dock's breadth                     | `--dock-size`                                                 |
| Avatar width                           | `--avatar-width`                                              |
| Motion                                 | `--ui-motion-short`, `--ui-motion-medium`, `--ui-motion-long` |

The values are in `globals.scss` and are deliberately not restated here — a copy of one in prose goes stale the
moment the `:root` block moves, and they are not even all one kind of value: a length beside a duration beside a
colour. The `:root` block is the list; read it for anything not named above,
including the ApexCharts tokens.

The goal is always attributify — a scoped class that only restates utilities is still wrong, even with the right variables:

```vue
<!-- WRONG — SASS variable, requires additionalData injection -->
<style scoped lang="scss">
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
