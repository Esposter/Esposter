# Shared list-item shells and controls inside link rows

Read when two or more lists render the same item layout with different trailing actions, or when a row is itself a link containing controls. Rendering one list's repeated items from an array is the `SKILL.md` rule; here only the _shell_ is shared.

## The shell with an action slot

When **multiple list components** (different data sources/stores) render the same item layout but need **different trailing actions**, extract the shared shell into one item component with a named `#append` slot. Trigger: the same `v-list-item` + prepend block copy-pasted across 2+ lists.

```vue
<!-- shared shell: prepend + title fixed, actions via slot -->
<v-list-item :title="name">
  <template #prepend><v-avatar size="36" mr-3>...</v-avatar></template>
  <template #append><slot name="append" /></template>
</v-list-item>

<!-- each list supplies only its buttons -->
<FooUserListItem v-for="{ id, name, image } of foos" :key="id" :image :name>
  <template #append><v-btn text="Remove" @click="$trpc.foo.deleteFoo.mutate(id)" /></template>
</FooUserListItem>
```

## Controls nested inside a link row

When the row itself is a link (`<v-list-item :to>` renders a real `<a href>`), every interactive control inside it goes in `StyledLinkRowActions`:

```vue
<template #append>
  <StyledLinkRowActions>
    <StyledTooltipIconButton icon="mdi-plus" text="Create" @click="..." />
  </StyledLinkRowActions>
</template>
```

`@click.stop` on the control is **not** enough and is the bug this replaces. The DOM fixes an anchor's activation target while building the event path, before any listener runs, so stopping propagation only suppresses the router's own handler — the one thing that would have called `preventDefault` — and the browser still follows the row's href, hard-loading the row's route on top of whatever the control just did. Only `preventDefault` cancels it, and it lives in the one wrapper so no row can hold half the pair. Buttons only: `preventDefault` would also cancel the default action of a control that has one (a checkbox's toggle).

## Shell attrs passthrough

When the shell's consumers need different root interactions (one passes `@click`, another `tabindex`), do NOT add props for them — declare `defineOptions({ inheritAttrs: false })` and spread onto the actual interactive element: `<v-list-item :="{ ...props, ...$attrs }">` (here `props` comes from a wrapping `v-hover` slot). Render optional chrome only when the consumer supplies it: `v-if="$slots.default"` around the hover/focus action toolbar. Use VueUse `useFocusWithin(useTemplateRef(...))` for focus-visibility instead of hand-rolled focusin/focusout handlers (a `@ts-expect-error TS2590` may be needed on Vuetify component refs).
