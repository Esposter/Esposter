# Element hyperlinks

A link on an element, set with a shortcut, that opens a web address when a reader clicks the element.

## Why deferred

An element has no link field ([positioned elements](../../../specs/vue-block-editor-headless/positioned-elements/design.md)), and a link is a web address the board would render as a clickable target. The address must be checked before it is stored, so a script address cannot be saved, and it must be rendered safely in the editor. The link would also have to reach the exported SVG, which is drawn from the model. The address check and the safe rendering are the work this record waits on.

**Revisit when:** a reader asks to link a shape, and the address check and safe rendering are designed.
