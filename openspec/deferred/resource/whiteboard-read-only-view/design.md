# Whiteboard read-only view

A read-only view of a board that shows its content with no palette, toolbar or editing.

## Why deferred

The read-only view is the published view, and the [whiteboard published view](../whiteboard-published-view/design.md) record defers it. The view needs the public route and the publish capability, and the whiteboard declares neither, so a read-only board has no route to be shown on. A read-only switch inside the owner's own editor would be a second route to the same view, and the editor already shows the board. The published view record decides the view.

**Revisit when:** an owner asks to share a board with people who are not logged in, the trigger the published view record names.
