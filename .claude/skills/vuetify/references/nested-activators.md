# Activator stacks the primitives don't cover

Read when one button activates more than one overlay and no primitive fits — a `v-dialog` or `v-hover` in the stack, a non-icon activator, three-way nesting. For the two common stacks use `StyledTooltipIconButton` / `StyledTooltipMenuIconButton` instead (`SKILL.md`).

Combine each overlay's slot props with `mergeProps(...)` from `vue` on a single `:=`. **Never stack two `:=` binds** — a second `v-bind` of the same key silently overrides the first, dropping the loser's `onClick`/`onMouseenter`/`class`, where `mergeProps` chains handlers and concatenates `class`/`style`.

**Order: structural/outer activator(s) first, tooltip last** — `mergeProps(dialogProps, tooltipProps)`, or three-way `mergeProps(tooltipActivatorProps, hoverProps, buttonProps)`.

```vue
<v-dialog>
  <template #activator="{ props: dialogProps }">
    <v-tooltip text="Options">
      <template #activator="{ props: tooltipProps }">
        <v-btn icon="mdi-dots-vertical" :="mergeProps(dialogProps, tooltipProps)" />
      </template>
    </v-tooltip>
  </template>
</v-dialog>
```

A custom dialog/menu button that exposes an `#activator` slot **merges its own tooltip into the slot props** (`<slot name="activator" :="mergeProps(dialogProps, tooltipProps)" />`) so consumers just bind the scope (`:="activatorProps"`). Consumers must **not** wrap such an activator in a second `v-tooltip` — it already has one.
