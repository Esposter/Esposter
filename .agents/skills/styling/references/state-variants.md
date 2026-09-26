# State Variants

Read when a colour changes on hover, focus, selection or disabled, or a shaded cell also takes a state tint.

A colour that changes on hover/focus/disabled is a variant utility (`hover:text-text`, `focus-within:b-info`, `disabled:op-disabled`), never a scoped `&:hover` rule. Colons inside attribute names are valid in Vue templates — only a **leading** `:` triggers `v-bind`.

**A hover or selected background is the library's tint, never a hand-picked surface colour**: `hover:bg="[color-mix(in_srgb,var(--ui-tint)_10%,transparent)]"`, and 20% for the selected or highlighted one, as `ui-item` draws a row in `uno.config.ts`. A row of a list wears `ui-item` itself, and anything pressed wears `ui-button` (`ui-library` skill). The tint is a style token, so a custom affordance lands on exactly the colour a list row does in every style and mode; `hover:bg-panel` instead is a shade off every row beside it, invisibly until the two sit together.

**A standing shade under a state tint is a `background-image`.** A cell shaded for what it is — a weekend, a day of another month, an hour outside the working day — draws the shade as `linear-gradient(<colour> 0 0)` in its scoped style, leaving `background-color` to the hover utility and the selected or drop-target data attribute, so the tint shows over the shade instead of losing to it: a scoped rule is unlayered and beats any utility regardless of specificity (`apps/web/app/components/Ui/EventCalendar/MonthDay.vue`).

The tint is an **overlay over whatever is underneath**, not a palette: a control whose background is itself the design — a chip swapping its own fill to read as selected — keeps its explicit colour.
