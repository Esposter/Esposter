# Node Visibility

Hiding a layer from the canvas and the output without deleting it, through a visibility control in the layers tree. It covers the email row "Hide a layer (visibility eye)" and the webpage row "Hide a layer". GrapesJS offers a hidable option on each layer, and our layers tree has no visibility control.

## Why deferred

A hidden node has to be left out by every reader of the document: the canvas, the publish render of a webpage, the render of an email to MJML and the compile that checks it ([document model](../../../specs/resource/page-builder/document-model/design.md)). The document model holds no hidden flag, and the layers tree has no control for one ([webpage layout](../../../specs/resource/webpage-layout/design.md)). A flag that only some readers honour would show a node in the editor and not in the output, or the reverse. The flag belongs in the document model first, with each reader named in the same design.

**Revisit when:** a document-model change adds a hidden flag and names the canvas, the webpage publish render, the email render and the email compile as the readers that honour it.
