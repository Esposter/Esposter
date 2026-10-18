# Style panel

The webpage editor's Style and Theme panels, built once the [canvas](../resource-page-builder-canvas/design.md) draws the page and its tabs and [undo as patches](../resource-page-builder-undo-as-patches/design.md) records an edit.

## The style panel

A style belongs to the node it styles. Each webpage node carries a `style` prop: for each breakpoint, for each state, a map from a property the panel offers to a CSS value. The renderer gives a styled node a class from its id and emits its rules after the theme's tokens and each type's structural CSS — base first, then the tablet and the mobile media queries, a state after its default within each — so a later breakpoint overrides an earlier one, desktop-first. There is no free stylesheet, no selector the author writes, and no class shared between nodes, which removes the selector manager, `componentFirst` and the private-class bookkeeping GrapesJS needs.

- **Breakpoints** are three, after Webflow's: base, tablet at 991 pixels and below, mobile at 478 and below, read from the module the canvas names its device widths in. The device toggle is the active breakpoint: editing at tablet writes the tablet override. Base is desktop and names no width; the canvas keeps its desktop frame at 992 pixels or wider, so base is what it shows.
- **States** are default and hover. Hover on a type a reader can focus emits for `:focus-visible` too, so no hover-only affordance ships.
- **Tokens** are the page's own, on the root: named colours and font stacks, emitted as custom properties and edited in the Theme panel. A colour field lists them as swatches first and a free colour second, and picking one stores `var(--color-name)`, so editing the token recolours everything that uses it. These are the page's tokens, not the app's palette: the app's tokens theme the editor around the canvas, while a published page has one look of its author's.
- **Values** are free CSS within the property, checked with `CSS.supports` as they are typed; an invalid value stays in its field with the field's error and writes nothing. At the schema, a value is length-limited and excludes `<`, `{` and `}`, as [the canvas](../resource-page-builder-canvas/design.md) section says.

The panel is grouped the way `WebpageEditorStyleManager` groups it today, each sector a `UiCollapsible` that says how many overrides it holds: layout and flex, spacing as a box of four fields with a link toggle, size, position, typography, background as a list of colour, image and gradient layers (what `grapesjs-style-bg` added), border, and effects. Each field shows the value at the active breakpoint and state, or the inherited one as a placeholder saying where it comes from ("from Desktop"), with a reset that removes the override. The controls are the library's: `UiTextField` with a unit `UiSelect` for a length, where the arrows step the number and keep the unit, Shift by ten; `UiToggleGroup` for alignment, direction and decoration, icon-only with their titles as their names; `UiColorField` with the token swatches, which the library grows first, in a commit of its own; `UiSlider` for opacity. A drag on a slider previews in the canvas without writing history and commits one entry when it settles, which the slider's `end` already reports for a key too. Copy style and Paste style are commands, the reuse a shared class would otherwise give.

The field components take a value and its inherited placeholder, with no breakpoint of their own, so the [email editor](../resource-page-builder-email/design.md) draws its attribute fields with them.

```mermaid
flowchart TD
  FIELD["a style field at the active breakpoint and state"] --> CHECK{"CSS.supports, the length limit, no brace or angle bracket?"}
  CHECK -->|no| ERR["the field's error; nothing written"]
  CHECK -->|"a slider mid-drag"| PREVIEW["the canvas previews it; no history"]
  CHECK -->|yes| PATCH["an update-props patch on the node's style, one interaction"]
  PREVIEW -->|"end"| PATCH
  PATCH --> EMIT["the renderer: base, then tablet, then mobile, hover with focus-visible"]
  EMIT --> SHEET["the canvas's constructed stylesheet, rebuilt once per frame"]
```

## Key files

| File                                                               | Role after the change                               |
| ------------------------------------------------------------------ | --------------------------------------------------- |
| `apps/web/app/components/Ui/ColorField.vue`                        | the page's token swatches before a free colour      |
| `apps/web/app/components/Ui/Slider.vue`                            | its `end` commits a drag's one history entry        |
| `apps/web/app/services/webpageEditor/WebpageEditorStyleManager.ts` | the sectors the panel keeps; deleted at the cutover |
| `apps/web/shared/models/webpageEditor/data/WebpageEditor.ts`       | the root's tokens beside the content                |

New code lands here:

```text
apps/web/shared/models/pageBuilder/                  a node's style per breakpoint and state, the page's tokens
apps/web/shared/services/pageBuilder/                each styled node's rules in the renderer's stylesheet
apps/web/app/store/pageBuilder/                      the active breakpoint and state, and the copied style
apps/web/app/components/PageBuilder/StylePanel/      the sectors and their fields
apps/web/app/components/PageBuilder/ThemePanel/      the page's colours and font stacks
```

## Sources

- [Webflow — Design for even larger screens with 3 new breakpoints](https://webflow.com/updates/design-for-even-larger-screens-with-3-new-breakpoints) — a desktop base that applies everywhere unless overridden, tablet at 991 pixels and below and mobile portrait at 478 and below, the cascade and breakpoints the style panel takes.
