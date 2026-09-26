# The Parent Owns Spacing

Read when spacing siblings, padding a boundary, or a margin looks like the fix.

Space between siblings belongs to the container, as `gap-*`. Space inside a boundary belongs to that boundary, as `padding`. A child should not carry a margin to position itself against its siblings — it can't know what it sits next to, so the same margin gets re-solved in every component that renders it.

Three reliable signals that a margin is in the wrong place:

- **A reset undoing a default** (`mb-0`, `class="m-0"`) — the child is fighting spacing it should never have had. Fix the owner, don't stack a counter-margin.
- **A negative margin** (`ml--2`, `my--1`) — the parent's padding and the child's margin are fighting; one of them is wrong.
- **The same margin in sibling files** (`<UiIcon mr-2 />` repeated across rows) — that's one gap the row should own, not N margins.

Margin stays correct for a few things: pushing an element within an already-`gap`-ed row (`m-a`, `mt-a`), and off-scale nudges that aren't sibling rhythm at all — though reach for absolute positioning first. When converting a child margin to a parent `gap`, check the trailing edge: a `mb-*` on every child also pads _below the last one_, which `gap-y-*` deliberately does not. If that trailing space was load-bearing (scroll breathing room), move it to the container's `padding`, don't reintroduce the margin.
