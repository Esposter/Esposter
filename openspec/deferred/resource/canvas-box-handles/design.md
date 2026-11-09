# Canvas Box Handles

Resize handles on a placed element, and margin and padding offsets drawn over it on the design canvas. It covers the email row "Resize an element with a handle", the email row "Margin and padding offsets on the canvas", the webpage row "Resize a node with a handle" and the webpage row "Margin and padding offset overlay". GrapesJS draws a resize spot from a component's resizable options and an offset spot for its margin and padding. Neither reaches our canvas, which types sizes and spacing in the style fields instead.

## Why deferred

The canvas overlays draw the hover outline, the selection outline and the drop indicator, and none of them writes a size back ([canvas design](../../../specs/resource/page-builder/canvas/design.md)). A handle needs two decisions first. The first is the unit. MJML's image width takes pixels only and refuses auto ([MJML blocks](../../../specs/mjml-blocks/README.md)), so a dragged email size has to land on a unit the email accepts. The second is the breakpoint. A webpage size is set per breakpoint and per state, so a drag on the tablet frame would write the tablet override, and the design has to name that. A handle also shares the pointer routing that a placed node's drag needs across the frame, and that drag is not built. Until both decisions are made, the Size and Spacing fields are how a size is set.

**Revisit when:** a placed node can be dragged on the canvas, and a handle design names the unit each email width takes and the breakpoint a webpage drag writes.
