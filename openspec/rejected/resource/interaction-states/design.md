# Interaction States

Styling a webpage node for interaction states beyond its default and hover. It covers the webpage row "Interaction states". GrapesJS's state API holds any number of states on a component, and our style panel offers default and hover, with focus-visible on focusable types.

## Why not

The style panel fixes the states at default and hover, and a focusable type's hover style also applies on keyboard focus, so no hover-only affordance ships ([style panel](../../../specs/resource/page-builder/style-panel/design.md)). Each state is a key beside the breakpoint in every node's style, and the renderer emits a state's rules after its default within each breakpoint. A further state would add a key to every node's style and an order its rules keep, and the panel's Default and Hover toggle would have to grow to match. The design holds the set at two.
