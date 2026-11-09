# Frame element

A frame that clips the elements placed inside it and moves them with it, drawn as a labelled container.

## Why deferred

The positioned document is one flat list in stacking order. The only reference between elements is an arrow end's binding to a shape, and nothing holds other elements inside it ([positioned elements](../../../specs/vue-block-editor-headless/positioned-elements/design.md)). A frame needs that reference: which elements it contains, so that a move carries them, a delete takes them, and the clip hides whatever leaves its edge. The containment is the same model that the [element groups](../element-groups/design.md) record waits on. The whiteboard layout design lists a frame under Not built, and a frame would be the first element that owns others.

**Revisit when:** element containment is designed, which also settles the element groups record.
