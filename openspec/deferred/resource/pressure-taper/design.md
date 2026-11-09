# Pressure taper

Freehand strokes that taper, either at a constant width that narrows toward the ends or at a width that varies with the pen's pressure.

## Why deferred

A stroke holds one width for its whole length, and its outline is drawn at that width ([positioned elements](../../../specs/vue-block-editor-headless/positioned-elements/design.md)). A taper needs a width at each point, which the stroke model does not hold, and an outline builder that offsets each point by its own width, which the polyline drawing does not do. The taper also works on the same path data that smoothing sets, so it waits until smoothing is built.

**Revisit when:** freehand smoothing ships, since the taper is built on the path data smoothing changes.
