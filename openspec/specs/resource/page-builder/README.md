# Page builder

The webpage and email editors share the document model they build on and the undo each open document keeps.

- [Canvas](canvas/design.md) — the frame a page is drawn in at its device widths, with its overlays and the pointer, keyboard and layers paths that move its nodes
- [Style panel](style-panel/design.md) — each node's styles kept per breakpoint and state, emitted as its own rules and edited through the library's controls
- [Document model](document-model/design.md) — the webpage and email documents as typed node trees, and how a finished document becomes the page or the email a reader gets.
- [Keyboard](keyboard/design.md) — the one table of keys the canvas and the editor take, the handler each key is offered to, and the text fields that keep their keys.
- [Undo as patches](undo-as-patches/design.md) — each open resource's undo and redo as JSON Patch operations, with the inverses that undo them kept beside the operations that redo them.
