# Elbow arrow routing

An elbow route for an arrow that goes around the shapes it passes, with segments the reader can adjust.

## Why deferred

The right-angled route leaves each end along its connection point through a short stub, then joins the stubs with right angles ([positioned elements](../../../specs/vue-block-editor-headless/positioned-elements/design.md)). It does not look at the shapes between the ends, so a route can cross a shape. Going around shapes needs an obstacle-aware router, which the core does not have. Adjustable segments need the route to store its bends, and an arrow stores two ends and a path kind, so the arrow model would change as well. The whiteboard design lists right-angled routing with no obstacle avoidance.

**Revisit when:** an obstacle-aware router is designed.
