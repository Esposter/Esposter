# Template Bindings

Read when writing a `v-for`, or an event binding with a modifier. The one-line rules are in `SKILL.md`; this page is their full statement.

- **`v-for` destructuring** — destructure when properties are accessed (`v-for="{ value, icon, title } of items"`); keep a full reference only when the whole object is needed (passed as prop or stored), naming the loop var to match the target prop for `:propName` shorthand.

- **Event modifiers over raw event methods** — `@click.stop`, `@keydown.enter.prevent` (`vue/no-restricted-syntax`). Raw calls stay correct where no modifier can encode the trigger: behind a runtime guard, and in programmatic listeners (`useEventListener`, `onKeyStroke`, Tiptap `onKeyDown`). `stopImmediatePropagation()` is banned outright — it couples behaviour to listener registration order.
