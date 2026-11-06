# vue-block-editor-headless

`packages/vue-block-editor-headless` (npm `vue-block-editor-headless`) is the editing model of a block editor: a tree of typed nodes and the commands that change it as JSON Patch operations. Its undo history is [the shared package's bounded history](../shared/bounded-history/design.md), not its own. It knows no editor's node types and has no DOM dependency, and its one Vue use is the editing-session composable, so the page builder's webpage and email editors are its consumers rather than its owners. Its features are the [editor core](editor-core/design.md), the tree of typed nodes and its commands, and the [positioned elements](positioned-elements/design.md), the placed model a whiteboard edits beside that tree.

The package takes a registry from its consumer: each block type's props schema and the child types each slot accepts. Each command returns the JSON Patch operations that make an edit, and each query returns what it reads; nothing mutates a document, so the same code runs in an editor's store and in a server process applying an agent's edit.

## Sources

- [RFC 6902 — JSON Patch](https://www.rfc-editor.org/rfc/rfc6902.html) — the operations a command returns.
- [Puck — Data](https://puckeditor.com/docs/api-reference/data) — the tree's shape and the allow lists a slot carries.
