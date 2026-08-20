# Button Backgrounds — the Two Rules That Decide the Fill

Read when a button's background is not what you expected, or when reaching for `variant="elevated"` to get a fill back.

1. `globals.scss` (`@layer vuetify-overrides`) transparentises **colourless** flat buttons only: `.v-btn--flat:not([class*="bg-"])`. A `color` on an `elevated`/`flat` variant emits a `bg-*` class in the later `vuetify-utilities` layer, so that fill survives — never add `bg-transparent` to a colourless button, it is already transparent.
2. **A parent container can override the variant.** `v-card-actions`, `v-toolbar` (so also `StyledPageHeader`), `v-toolbar-items`, `v-banner-actions`, `v-bottom-navigation`, `v-snackbar`, `v-btn-group`, `v-stepper-actions` all `provideDefaults({ VBtn: { variant: … } })` — mostly `"text"`. `variant="text"` routes `color` to the **text**, not the background, so no `bg-*` class is emitted and rule 1 then paints the button transparent.

## Do not fight rule 2 with `variant="elevated"`

Transparent-on-container is the app's look, and a lone re-elevated button is the odd one out. A filled action inside a container uses a primitive that is immune because it paints with `background-image`:

| Need                              | Use                                              |
| --------------------------------- | ------------------------------------------------ |
| Filled primary action (label)     | `StyledButton`                                   |
| Icon action in a toolbar / header | `StyledTooltipIconButton` (transparent, no fill) |
| Destructive confirm               | `color="error"` `v-btn` — red text, no fill      |

Corollary: `color` on a container-nested `v-btn` only tints text. Never reach for a non-semantic theme colour as a fill (`color="border"` is for borders) — that only ever worked via an explicit `variant="elevated"`.

## The one deliberate exception

A **deliberately raised** button (e.g. a raised add action in a page header) restates the variant, and it needs **both** halves — `variant="elevated"` to beat the container's `"text"`, and `flat: false` to beat the global `VBtn` `flat` default, since elevation only applies when `variant === "elevated" && !flat`:

```vue
<StyledTooltipIconButton
  icon="mdi-plus"
  :button-props="{ flat: false, variant: 'elevated' }"
  :is-icon-button="false"
  text="Add Foo"
/>
```
