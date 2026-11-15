# Node Names

Renaming a layer to a name the author chooses, shown in the layers tree in place of the type's title. GrapesJS lets an author edit a layer's name on double-click, and our layers show each node's type title.

## Why not

A layer's label is its type's title, read from a map keyed by every webpage node type ([canvas design](../../../specs/resource/page-builder/canvas/design.md)). That design already rejected a title on the shared type definition, since the publish render never reads one. A name an author types would have to be stored on the node, which makes it a prop that only the editor reads, while nothing shows it on the published page. Whether a name belongs in the model turns on whether a render reads it, and none does.

A document-model change that adds a stored name to nodes, and names the render that reads it, would reopen it.
