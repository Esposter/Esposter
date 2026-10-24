## 1. Storage and output

- [x] 1.1 Store each node's styles per breakpoint and state, with no shared class and no free stylesheet. Verify: a test named after the scenario 'A style applies only to the node it was set on'.
- [x] 1.2 Emit the breakpoint rules desktop first, with each override applying at its width and below, and the hover rule also on keyboard focus. Verify: tests named after the scenarios 'A tablet override applies at 991 pixels and below', 'A mobile override wins over a tablet override' and 'A hover style also applies when a reader tabs to a button'.

## 2. Values and tokens

- [x] 2.1 Check each value the browser accepts as it is typed, refusing braces, angle brackets, comment delimiters and over-long values. Verify: tests named after the scenarios 'An unsupported style value stays in its field unsaved' and 'A style value with a brace is refused'.
- [ ] 2.2 Grow `UiColorField` its token swatches in a commit of its own, then draw the Theme panel and store a colour picked from the theme as a reference to it. The Theme panel draws the tokens without swatches, so the reference half waits for the style panel's colour field in task 3.1. Verify: a test named after the scenario 'Changing a theme colour recolours every node that uses it'.
- [ ] 2.3 Give each token swatch in `UiColorField` the `ui-button` surface its pressed state needs, as the library's rule for anything pressed requires. The button's minimum size, raised shadow and padding change the swatch's 24-pixel size, and its inline fill hides the accent pressed indicator, so decide how the swatch keeps its size, its colour and its pressed mark before adding the class. Verify: the library-layout check in `apps/web/app/templates.test.ts` passes for the swatch.

## 3. Panel

- [ ] 3.1 Draw the style sectors with the shared UI library's controls, showing the inherited value and offering reset. The colour field lists the theme's colours as `UiColorField` swatches and stores a picked one as `var(--color-name)`, which closes task 2.2. Verify: tests named after the scenarios 'A field shows the inherited value and where it comes from', 'Reset removes an override' and 'Changing a theme colour recolours every node that uses it'.
  - Done: the sectors, the Default/Hover state toggle, the colour fields with theme swatches, the opacity slider, the Reset button and the inherited placeholder. Files: `apps/web/app/components/PageBuilder/StylePanel/Index.vue`, `apps/web/app/components/Ui/ColorField.vue`, `apps/web/app/services/pageBuilder/constants.ts` (`STYLE_SECTORS`, `STYLE_COLOR_PROPERTIES`).
  - Open: the alignment and direction choices (`flex-direction`, `justify-content`, `align-items`, `text-align`) as `UiToggleGroup`. Blocker: `UiToggleGroup` (`apps/web/app/components/Ui/ToggleGroup.vue`) is mandatory, so it cannot show an unset property, and it may select its first item on mount, which `setField` would write into the node. Before wiring it, mount the panel in a test on a node with no style and assert no edit is recorded. Only then add a choice table in `constants.ts` and a `v-else-if` branch in the panel.
  - Open: the length unit as a `UiSelect` with arrow stepping, and background layers. Neither is started.
- [x] 3.2 Add Copy style and Paste style as commands. Verify: a test named after the scenario 'Paste style applies copied styles to another node'.
- [x] 3.3 Preview slider drags on the canvas and record one undoable change on release. Verify: a test named after the scenario 'Dragging an opacity slider records one undoable change'.

## 4. The record

- [ ] 4.1 Describe the style storage, the emitted rules and the two panels as built, then archive this change. Verify: the checks task 5.1 of [performance and proof](../resource-page-builder-performance-and-proof/tasks.md) names pass.
  - Owed before archiving: the finishing audit on `d222a7a7`, `f0b3fea8`, `10d898c8`, `7c12218a` and `19578585`. The `code-review` pass over both lanes has not run on them, and `document-model/design.md` still needs its prose checked against the cascade.
