# The Document Chrome

Read when styling a scrollbar, the selection, the caret, a native control's accent or the focus ring, or putting a region in another theme.

Scrollbars, selection, the caret, native control accents and the focus ring live once in the `ui-chrome` layer of `apps/web/app/assets/css/globals.scss`. A page never restates them, and a component that wants its own focus or selection treatment simply declares it — the layer is first in `apps/web/app/assets/css/layers.css`, so no override is needed. A region in another theme is a `UiThemeScope`, never a palette set on its root; the chrome follows it.
