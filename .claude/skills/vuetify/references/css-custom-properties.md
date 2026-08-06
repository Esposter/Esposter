# CSS custom properties for component styles

Read when a component genuinely needs a `<style>` block (`:deep()`, `@keyframes`, element selectors) and a shared value inside it. SASS variables are banned there (SKILL.md § No SASS Variables in Component Styles); these are the `:root` properties in `globals.scss` to use instead.

| Purpose                       | CSS custom property          | Value                                               |
| ----------------------------- | ---------------------------- | --------------------------------------------------- |
| App bar height                | `--app-bar-height`           | `56px`                                              |
| Vuetify avatar width          | `--avatar-width`             | `40px`                                              |
| Vuetify border width          | `--border-width`             | `thin`                                              |
| Vuetify border style          | `--border-style`             | `solid`                                             |
| Vuetify border radius         | `--border-radius`            | `4px`                                               |
| Vuetify transition speed      | `--transition-duration`      | `0.3s`                                              |
| Vuetify move transition speed | `--transition-move-duration` | `0.5s`                                              |
| Vue gradient                  | `--vue-gradient`             | `linear-gradient(45deg, #42d392 25%, #647eff)`      |
| Midnight bloom                | `--midnight-bloom`           | `linear-gradient(-20deg, #2b5876 0%, #4e4376 100%)` |

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
