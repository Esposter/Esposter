# headless-block-editor

`packages/headless-block-editor` (npm `headless-block-editor`) is the editing model of a block editor: a tree of typed nodes, the commands that change it as JSON Patch operations, and the history that undoes them. It knows no editor's node types and has no Vue or DOM dependency, so the page builder's webpage and email editors are its consumers rather than its owners. Its one feature so far is the [editor core](editor-core/design.md).

The package takes a registry from its consumer: each block type's props schema and the child types each slot accepts. Every function takes a document and returns a new one or the operations that make it, so the same code runs in an editor's store and in a server process applying an agent's edit.

## Sources

- [RFC 6902 — JSON Patch](https://www.rfc-editor.org/rfc/rfc6902.html) — the operations a command returns.
- [Puck — Data](https://puckeditor.com/docs/api-reference/data) — the tree's shape and the allow lists a slot carries.
