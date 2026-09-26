# Lengths

Read when writing any authored CSS length, or an empty element sized along a flex axis.

- **Always `rem`, never `px`** for every authored CSS length — style blocks, `:root` tokens, inline style objects, arbitrary `[...]` values. Zero takes no unit (`bottom: "0"`). Utility names are not authored lengths, so scale tokens (`p-4`, `top--1`) and `b-{n}` widths keep their canonical form.
  - **`px` survives only where the unit is not ours to choose**: a value staying numerically in step with a JS API (a drawer width also passed as a number to script), SVG user-space attributes, HTML email, and vendored output mirrored into a snapshot.
  - A round `px` that is already a token is a duplicated constant first — a `gap: "4px"` wants `var(--ui-step)`, not `"0.25rem"`.

- **An empty element sized along a flex axis takes `shrink-0`** — a separator, a spacer bar, a dot. With no content its minimum size is zero, so once the container overflows (a menu capped by `max-h` and scrolling) the browser takes the space back from it first: the `h-1` still computes, the margins still show as a gap, and the bar paints at `0px`. A test counting the element cannot catch it.
