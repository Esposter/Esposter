# Editor drag preview

Two editors share the pieces of a drag: one ghost chip at the pointer, the edge autoscroll's speed rule, the touch hold, the Escape cancel and the refusal cue. Each editor keeps what is its own: which slots accept a kind, where the pointer lands, and how the block is drawn in place. The whiteboard draws no drag: it places an element with its tool, so it shares none of these pieces.

```mermaid
flowchart TB
  DOWN["pointer down on a palette kind or a node"] --> HOLD{"touch?"}
  HOLD -->|"yes"| WAIT["wait out the hold"]
  HOLD -->|"no"| MOVE
  WAIT --> MOVE["pointer moves past the threshold: the session starts"]
  MOVE --> FREEZE["read the canvas's boxes once, before any preview is drawn"]
  FREEZE --> HIT["resolve the pointer against those boxes"]
  HIT --> ACCEPT{"a slot that accepts the kind?"}
  ACCEPT -->|"yes"| DRAW["the editor's draw: the kind with its defaults, in place"]
  ACCEPT -->|"no"| REFUSE["refusal cue"]
  DRAW --> EDGE{"near a frame edge?"}
  EDGE -->|"yes"| SCROLL["autoscroll the frame"]
  DRAW -->|"release"| PATCH["one insert or move patch"]
  MOVE -->|"Escape or release elsewhere"| NONE["no patch"]
```

## Decisions

- **The preview is drawn in the render path, not written to the document.** The session hands the editor a pending insertion, `{ slot, index, node }`, and the editor's own canvas renderer draws that node among the slot's children, marked as a preview and not selectable. The document, the history and the undo stacks never see it. Rejected: inserting the real node and removing it on cancel, which leaves history entries a cancelled drag must not leave.
- **The node is the kind's defaults.** The preview draws `createDefaultProps` for the kind, the same node a click would insert, so what the reader sees is what lands.
- **Each editor resolves its own target.** The page builder's nearest ancestor slot whose allow list accepts the kind is the target, and the index is the first child whose midpoint the pointer has not crossed; the survey resolves pages and panels the same way over its own boxes. Rejected: one resolver for both, whose slots have nothing in common but the rule.
- **The boxes a move resolves against are read once, as the drag starts.** The preview pushes the nodes after it along, so boxes read live would move under a pointer held still and flip the target between two slots with every redraw. A frozen frame answers every move from the boxes that stood before the preview, moved by what the frame has scrolled since, and finds the node under the pointer from those boxes; the survey's canvas reads its slot boxes once for the same reason. A browser's rect holds its sides as getters on its prototype, so a frozen box is built from them and never spread. Rejected: reading the boxes live and moving the children after the preview back by what it pushed them, which a driven browser showed flipping the target at a pointer held still, since the margins between blocks stop collapsing once the preview sits between them.
- **One press tracker serves the two drags.** A composable owns the press: the window listeners filtered on its pointer id, the drag start distance, the touch rest and its tolerance, the click a release swallows, Escape, and the state of whether the press is a drag and where its pointer is. Each editor keeps what a move draws and what a release lands. A finger that drifts past the long press tolerance before it rests is scrolling, for both. The reorder list shares the press-move rule and the click swallow. Rejected: a tracker in each editor's drag, which let the touch rule drift between them.
- **A press that became a drag always swallows its release's click.** A finger that rests the touch delay has started a drag, so its release belongs to the drag whether or not the pointer moved, and the control it rested on runs no click. Rejected: swallowing only once the pointer has moved, which let a finger that rested and lifted run both the drag and the control's own click.
- **The swallow ends at the first click, key or press, or when its window after the release elapses.** The click a release raises is dispatched straight after the release, so a window of a quarter of a second, held as one constant beside the touch delay, still catches it, and a touch drag that raises no click does not leave the swallow armed for a click a script or assistive technology raises later. Rejected: ending only at the next click, key or press, which let a touch drag's swallow outlive its release and eat a later click.
- **The page builder holds a touch and scrolls at an edge.** Its drag holds a touch press for the reorder list's own delay and scrolls the frame near its edge. Each of the two touch drags, once started, cancels its own `touchmove`, so the page's scroll does not take the finger back and cancel the drag.
- **The whiteboard places an element with its tool, not by a drag.** A press with a placing tool in hand places the element at the point, and a drag sizes it, so there is no node to preview and no ghost to carry. Rejected: a drag out of a palette, which places only at a default size, needs the pointer to cross the whole canvas from a list's edge, and lands the element where the reader must drag it again to reach.
- **The twin is unchanged.** Alt+arrow, Move to… and Insert stay as the keyboard path to the same patch, which is what makes a drag permissible.
- **A refused target says why.** The cue names the rule, "A Column goes in Columns", where the pointer is, so a refusal is never a silent no-op.

## Key files

| Path                                                         | Role                                                                                              |
| :----------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| `apps/web/app/composables/pageBuilder/usePageBuilderDrag.ts` | the page builder's drag session                                                                   |
| `apps/web/app/composables/survey/useSurveyCreatorDrag.ts`    | the survey Creator's drag, from the palette and from the canvas                                   |
| `apps/web/app/composables/ui/usePressDrag.ts`                | the one press tracker the two drags run on                                                        |
| `apps/web/app/services/ui/swallowNextWindowClick.ts`         | the click a release raises, swallowed once or until its window ends, here and in the reorder list |
| `apps/web/app/composables/ui/useDragReorder.ts`              | the autoscroll and the touch hold the session reuses                                              |
| `apps/web/app/services/pageBuilder/freezeFrameGeometry.ts`   | the canvas's boxes as they stood when the drag began                                              |
| `apps/web/app/services/pageBuilder/withDragPreview.ts`       | the page builder's document with the pending insertion in it                                      |
| `apps/web/app/services/pageBuilder/resolveDropTarget.ts`     | the page builder's hit test                                                                       |
| `apps/web/app/services/ui/holdPageStillWhile.ts`             | holds the page still under a finger whose drag has started                                        |
| `apps/web/app/components/Ui/DragGhost.vue`                   | the chip at the pointer                                                                           |
| `apps/web/app/components/PageBuilder/Canvas/Overlays.vue`    | the preview's outline and the drop line a frame cannot draw over                                  |

## Sources

- The page builder's [canvas design](../page-builder/canvas/design.md), the pointer drag and the keyboard twin this builds on.
- The survey Creator's [design](../survey-creator/design.md), whose two decisions against dragging this overturned.
