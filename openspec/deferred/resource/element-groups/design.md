# Element groups

Grouping several elements so that they select, move and delete as one.

## Why deferred

No element holds a group reference, so a selection is only the set of elements picked at the moment, and nothing keeps them together afterwards ([positioned elements](../../../specs/vue-block-editor-headless/positioned-elements/design.md)). A group needs a containment record, a move that carries every member and every arrow bound to a member in one edit, and a selection that treats the group as one unit. Without the containment record a group is only a selection, and a move of one member leaves the rest behind. The [frame element](../frame-element/design.md) needs the same containment record.

**Revisit when:** element containment is designed, the same design the frame element waits on.
