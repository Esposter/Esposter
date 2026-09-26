# Authoring a Library Component

Read when a library component overrides an attribute its call site may pass, or exposes an element to focus or anchor to.

- **The call site's attributes go on top of the primitive's.** When a primitive overrides what a call site passes — as the button does with `type` and `aria-pressed` — render the element from its attribute slot with `$attrs` spread after, and expose the element if something must focus or anchor to it.
