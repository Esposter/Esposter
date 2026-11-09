# Hatch fill styles

Hachure, cross-hatch and zigzag fills for shapes, beside the solid fill that is built.

## Why deferred

A shape's fill is one colour, drawn as a solid area in the editor and in the export ([whiteboard](../../../specs/resource/whiteboard/design.md)). A hatch is a repeated line pattern clipped to the outline, which the SVG writer would have to emit as a pattern definition for both the editor and the export. The model holds no fill style, and no pattern renderer exists. It is a renderer with a design of its own, not a field on the shape.

**Revisit when:** the fill-pattern renderer's design is written.
