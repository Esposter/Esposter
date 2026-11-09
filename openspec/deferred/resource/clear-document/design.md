# Clear Document

A command that empties an editor's canvas in place and keeps the resource. It covers the email row "Clear the canvas", the webpage row "Clear the canvas" under Templates and the webpage row "Clear the canvas" under Undo. GrapesJS has a canvas-clear command, and neither of our editors has one.

## Why deferred

An author reaches an empty document today in two ways. A new blank resource starts empty, and undo steps back through the recent edits ([undo as patches](../../../specs/resource/page-builder/undo-as-patches/design.md)). A clear command would be a third route to the same empty state, as one action that removes every root node. No owner has asked to empty a document in place, and removing a whole document in one step is destructive with no use behind it yet.

**Revisit when:** an owner asks to empty a document in place rather than start a new resource.
