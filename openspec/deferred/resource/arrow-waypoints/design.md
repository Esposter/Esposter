# Arrow waypoints

Midpoint handles on an arrow that add bends its route passes through, so an arrow can take a set path.

## Why deferred

An arrow holds two ends, each with a point, a binding and an optional arrowhead kind, and its route is computed from those ([positioned elements](../../../specs/vue-block-editor-headless/positioned-elements/design.md)). A waypoint is a point the route passes through, so each arrow would hold a point list, and its route, hit test and export would all read it. The core computes the straight, curved and right-angled routes from the two ends, so waypoints would override those routes as well. The arrow model changes first, and this record waits for that model.

**Revisit when:** a multi-point arrow model is designed.
