# Roadmap

Open work, each item linking the spec that owns it. Rationale lives in [editor drag preview](../../specs/resource/editor-drag-preview/design.md).

## Next

- [ ] [Click after a touch rest](../../specs/resource/editor-drag-preview/design.md) — the shared press tracker swallows the click a release raises only once the pointer has moved. A finger that rests the touch delay on a whiteboard palette item or a survey creator item, then lifts without moving, starts a drag that lands nothing, so the release's click reaches the item's own button handler. Before the tracker, the whiteboard palette and the survey creator swallowed the click after every drag they started. Decide whether a drag started by a rest swallows its release's click in all three editors (restoring the always-swallow those two had), or the movement rule stays as the page builder has it. The decision is written into the press tracker's decision in the drag-preview design, and the tracker's test pins it.
