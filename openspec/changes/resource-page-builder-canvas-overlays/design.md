## Context

The canvas draws its hover, selection and drop boxes in one overlay layer inside the frame, each positioned from its node's rect and redrawn after a scroll, a resize or a patch. The hover box has no name. The palette drag starts in the app's document with the frame's pointer events off, and resolves its slot by the document rather than the DOM. The node toolbar sits in the app's document beside the selected node, placed by `getToolbarPlacement`.

The canvas design already describes a node-handle drag in its pointer flowchart and its pointer paragraph, but its requirements and its code have none. GrapesJS moves a component from a handle on its toolbar, and names a hovered component on its hover spot.

## Gap analysis

| Feature                                                  | Verdict                                                                                |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Hover outline with the block's name [email]              | Built here: the hovered node's name, drawn in the overlay layer                        |
| Drag an existing block on the canvas to move it [email]  | Built here: a move handle in the node toolbar, dragged into the slot under the pointer |
| Hover outline with the node's name [webpage]             | Built here, the same overlay, shared by both editors                                   |
| Drag an existing node on the canvas to move it [webpage] | Built here, the same handle, shared by both editors                                    |

## Decisions

- **The name is drawn in the overlay layer, from the title the layers tree shows.** The label sits inside the frame's overlay layer, so it follows the redraw the overlays already get on scroll and patch. Its text is the row title `getLayerTreeItems` gives the node, the type's title from the kind's title map with no sibling number, so a hover label reads the same as the tree's row. It is not `getNodeTitle`, which Move to's paths and announcements use and which adds a sibling number: a hover on the second of two columns would read "Column 2" where the tree reads "Column". The title is one lookup, so the build lifts it into one function that the tree's rows and the label both call. The alternative was a tooltip in the app's document, which sits outside the frame and does not follow the node when the canvas scrolls. Another was the name in the node toolbar, which shows only on a selection and so names nothing on hover.
- **The label sits inside the outline's top edge.** A label above the node is clipped by the frame's edge for a node at the top of the canvas, which is the placement the node toolbar falls back from. The alternative was above the outline, which loses its name at the top of the frame.
- **The move handle is a control in the node toolbar.** The toolbar's move handle is where GrapesJS puts it. The drag starts in the app's document, so the frame's pointer events stay off as they are for a palette drag, and the drag reuses the palette drag's hit test, drop indicator and Escape. The alternative was a grip drawn on the selected box inside the frame, whose pointer events the frame takes, so it would need its own route for touch.
- **The handle drag is the canvas's own placement, not the layers tree's pointer reorder.** The [page builder rows](../../rejected/resource/page-builder-rows/design.md) page refuses "Reorder layers by dragging" as a second reorder route inside the tree, whose keyboard already moves a node. A handle drag is a different route: a node dropped into a slot on the canvas, which the [canvas design](../../specs/resource/page-builder/canvas/design.md) already describes in its pointer flowchart, and which the rejected page names as the canvas's route, not built yet. The alternative was a drag inside the layers tree, which the rejected page refuses for the reason above.
- **A node is not dropped into its own subtree.** `getAcceptingSlotPointers` already leaves a node's own subtree out of the Move to list. The drag applies the same exclusion, so a drop into the node's own children does nothing. The alternative was to let the move run and undo it, which would show a node inside itself for a frame.
- **A handle move is one history entry.** It is one move patch under one command, as the keyboard move already is, so one undo returns the node. The alternative was to record the drag's steps, which would make a single drag several undo steps.

## Rejected

- A permanent name on every node. It covers the page with text, so the name shows only while its node is hovered.
- A handle on every node at once. The handle appears on the selection, as the toolbar does, so a page is not covered with grips.

## Risks and trade-offs

- The toolbar's handle is a second place a drag starts. Both starts resolve the same slot and reject the same drops, so the rules are written once in the canvas spec.
- The label is one more box drawn on each hover, redrawn in the same animation frame as the outline, so it adds no frame of its own.

## Key files

| File                                                          | Role                                                                                                                    |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `apps/web/app/components/PageBuilder/Canvas/Overlays.vue`     | the overlay layer: the hover outline gains its name label at the top edge, the title the layers tree gives the node     |
| `apps/web/app/components/PageBuilder/Canvas/NodeToolbar.vue`  | the node toolbar gains the move handle, which starts the drag of the selected node                                      |
| `apps/web/app/composables/pageBuilder/usePageBuilderDrag.ts`  | the drag starts from a node as well as from a palette block, with the same hit test                                     |
| `apps/web/app/services/pageBuilder/getLayerTreeItems.ts`      | the layers tree's rows and the title each row reads from its node's type, which the hover label reads too               |
| `apps/web/app/services/pageBuilder/getToolbarPlacement.ts`    | the node toolbar's place, above its node or below it at the frame's top edge, which the label's inside placement avoids |
| `apps/web/app/composables/pageBuilder/usePageBuilderMoves.ts` | the move a handle drop commits, one patch, announced as the keyboard move is                                            |
| `apps/web/app/store/pageBuilder/canvas.ts`                    | the selection the handle acts on, and the drag's active node                                                            |

## Notes

- Once this ships, the first clause of the revisit trigger in [canvas box handles](../../deferred/resource/canvas-box-handles/design.md) holds, since a placed node can be dragged on the canvas, so the archive of this change re-reads that page. The trigger's second clause, the unit and breakpoint a handle writes, stays open, because this handle moves a node and sets no size.

## Sources

- [GrapesJS — Canvas](https://github.com/GrapesJS/grapesjs/blob/dev/docs/modules/Canvas.md) — the hover type highlights the hovered component and shows its component name, taken for the name on hover.
- [GrapesJS — Component](https://github.com/GrapesJS/grapesjs/blob/dev/docs/api/component.md) — the `toolbar` property, under which GrapesJS adds a `tlb-move` command to a draggable component's toolbar when none is set, taken for the move handle's place in the node toolbar.
