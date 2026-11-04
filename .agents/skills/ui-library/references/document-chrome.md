# The Document Chrome

Read when styling a scrollbar, the selection, the caret, a native control's accent or the focus ring, or putting a region in another theme.

Scrollbars, selection, the caret, native control accents and the focus ring live once in the `ui-chrome` layer of `apps/web/app/assets/css/globals.css`. A page never restates them, and a component that wants its own focus or selection treatment simply declares it — the layer is first in `apps/web/app/assets/css/layers.css`, so no override is needed. A region in another theme is a `UiThemeScope`, never a palette set on its root; the chrome follows it.

**The focus ring is the document's on every control.** A field and a row draw it just inside their edge, as `ui-field` and `ui-row` do, and add their tint beneath it. A component that hides the ring — `outline-hidden` beside an indicator of its own — stands behind an indicator that reaches 3:1 against what it sits on, such as a line or an underline. A tint alone is not one, and neither is `outline-none` or a transparent outline colour.
