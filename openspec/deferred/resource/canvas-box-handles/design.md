# Canvas Box Handles

Resize handles on a placed element, and margin and padding offsets drawn over it on the design canvas. GrapesJS draws a resize spot from a component's resizable options and an offset spot for its margin and padding. Neither reaches our canvas, which types sizes and spacing in the style fields instead.

## Why deferred

The canvas overlays draw the hover outline, the selection outline and the drop indicator, and none of them writes a size back ([canvas design](../../../specs/resource/page-builder/canvas/design.md)). A handle needs two decisions first. The first is the unit. MJML's image width takes pixels only and refuses auto ([MJML blocks](../../../specs/mjml-blocks/README.md)), so a dragged email size has to land on a unit the email accepts. The second is the breakpoint. A webpage size is set per breakpoint and per state, so a drag on the tablet frame would write the tablet override, and the design has to name that. A handle would also share the pointer routing a placed node's drag takes across the frame, which the canvas already routes through its node toolbar's move handle ([canvas design](../../../specs/resource/page-builder/canvas/design.md)). Until both decisions are made, the Size and Spacing fields are how a size is set.

**Revisit when:** a handle design names the unit each email width takes and the breakpoint a webpage drag writes.
