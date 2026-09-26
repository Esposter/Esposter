# Tooltips

Read when a control needs a name on hover, or when deciding whether a control takes a tooltip at all. The one-line rules are in `SKILL.md`; this page is their full statement.

- **A name shown on hover is a `UiTooltip`**, its activator props bound onto the element, never a `title` attribute, which the browser draws in its own look. Anything else bound there joins them in one `mergeProps(activatorProps, …)`, never a second `:=`, which silently drops the first's handlers (`vue/no-duplicate-attributes` refuses it). An icon button is `UiIconButton`, whose `label` is its name and its tooltip at once.

- **A tooltip is for a control with no visible text.** Every icon-only control has one, the visible twin of its accessible name; a control whose own text, or a label beside it, already says it — a text button, a filter pill, a date field — has none, so `UiPopover` and `UiMenu` take `isLabelShown`. A labelled control's inline `UiTooltip` says what its text does not: the exact time behind a relative one, the room header's Edit Room.
