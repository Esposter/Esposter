# CSS custom properties for component styles

Read when a component genuinely needs a `<style>` block (`:deep()`, `@keyframes`, element selectors) and a shared value inside it. SASS variables are banned there (SKILL.md § No SASS Variables in Component Styles); these are the `:root` properties in `globals.scss` to use instead.

| Purpose                       | CSS custom property          |
| ----------------------------- | ---------------------------- |
| App bar height                | `--app-bar-height`           |
| Vuetify avatar width          | `--avatar-width`             |
| Vuetify border width          | `--border-width`             |
| Vuetify border style          | `--border-style`             |
| Vuetify border radius         | `--border-radius`            |
| Vuetify transition speed      | `--transition-duration`      |
| Vuetify move transition speed | `--transition-move-duration` |
| Vue gradient                  | `--vue-gradient`             |
| Midnight bloom                | `--midnight-bloom`           |

The values are in `globals.scss` and are deliberately not restated here — they are lengths in `rem`, and a copy of
one in prose is how a page ends up quoting the `px` an earlier revision used. The `:root` block is the list; read
it for anything not named above, including the ApexCharts tokens.

The goal is always attributify — a scoped class that only restates utilities is still wrong, even with the right variables:

```vue
<!-- WRONG — SASS variable, requires additionalData injection -->
<style scoped lang="scss">
.panel {
  border: $border-width-root $border-style-root v-bind(border);
  top: $app-bar-height;
}
</style>
<!-- ALSO WRONG — scoped CSS class when attributify can do this directly -->
<style scoped>
.panel {
  border: var(--border-width) var(--border-style) v-bind(border);
  top: var(--app-bar-height);
}
</style>
<!-- CORRECT — attributify; no style block needed -->
<div b-1 b-border top="[var(--app-bar-height)]" />
```
