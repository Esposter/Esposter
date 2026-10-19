# Page builder

The webpage and email editors share the document model they build on and the undo each open document keeps.

- [Document model](document-model/design.md) — the webpage and email documents as typed node trees, and how a finished document becomes the page or the email a reader gets.
- [Undo as patches](undo-as-patches/design.md) — each open resource's undo and redo as JSON Patch operations, with the inverses that undo them kept beside the operations that redo them.
