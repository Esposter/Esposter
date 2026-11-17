# Pressure taper

Freehand strokes that taper, either at a constant width that narrows toward the ends or at a width that varies with the pen's pressure.

## Why deferred

A freehand stroke is one path of points, drawn as a smoothed curve at one width. The stroke model holds a single `strokeWidth` for the whole stroke, and both the canvas and the export draw the path with that width as a stroke attribute ([whiteboard](../../../specs/resource/whiteboard/design.md)). A taper needs a width at each point, which the stroke model does not hold, and a filled outline that offsets each point by its own half-width, drawn in place of the path on the canvas and in the export so the two stay one shape. Pointer pressure is not captured either: the gesture reads each pointer event's position, button, modifier keys and id, so a pressure taper would first need the pointer input to carry pressure. No reader has asked for a tapered stroke, so the change does not yet earn that cost.

**Revisit when:** a reader asks for tapered strokes, or the canvas starts capturing pen pressure.
