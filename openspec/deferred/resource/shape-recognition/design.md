# Shape recognition

Turning a drawn outline into the basic shape it resembles, such as a rectangle, an ellipse or a diamond.

## Why deferred

A freehand stroke is a sampled point list, and a shape is a closed outline of one kind ([positioned elements](../../../specs/vue-block-editor-headless/positioned-elements/design.md)). Recognising the kind needs a classifier over the points and a rule for when a stroke is replaced by a shape, and the app has no design for either. The toolbar already places each shape by choosing its tool and drawing it, so a recogniser would add a second route to a placement a reader makes in one gesture.

**Revisit when:** a recogniser design is written and a reader asks for drawn outlines to become shapes.
