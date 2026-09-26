# Popovers

Read when a component opens a panel through `usePopover` — a popover, a menu, a caret popover, suggestions — or wires its open state to a parent. That a panel is the library's is in `SKILL.md`; this page is how its openness is held.

**A popover's open state is the ref handed to `usePopover`, never a mirror of the one it returns.** Its `isOpen` option takes the component's own `defineModel` and owns the rest: an immediate watch shows or hides the panel from the ref, and its `toggle` listener writes a light dismiss or a `popovertarget` press back into it. So the library writes no watcher between the two — one each way echoed a parent's write back as an `update:` and missed a panel mounted open (`Ui/Popover.vue`, `Ui/Menu/Index.vue`).

A manual popover whose openness is derived takes a `computed` with a `noop` setter, since only its own show and hide ever write it (`Ui/CaretPopover.vue`, `Ui/Suggestions.vue`).

The panel cannot refuse an open by leaving the model alone: `popovertarget` opens it before the ref is written.
