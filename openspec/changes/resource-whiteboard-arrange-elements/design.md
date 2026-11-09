## Context

The panel for one selected element holds its fill and its stacking, and the stacking moves that element to an index of the element list with one command. The panel for a selection of several holds the fill the shapes share and the footer, and no stacking, because the stacking commands move one index and a selection needs one list of operations over all of its members. A move of an element through the positioned model reroutes each arrow bound to a moved shape in the same edit, and a drag already uses it. Commands are keyed by the selection, and a key is bound only while there is a selection.

## Gap analysis

Each row is a feature of Excalidraw, the reference product, with the verdict this change gives it.

| Feature                                                    | Verdict                                                                                                  |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Align                                                      | Built here: six edge and centre commands for a selection of two or more boxes, through the existing move |
| Distribute                                                 | Built here: equal gaps between the boxes of a selection of three or more, horizontally or vertically     |
| Bring forward, send backward, bring to front, send to back | Built here: the four controls move a whole selection, and their keys are bound for the selection         |

## Decisions

- **Align and distribute act on boxes only.** A box is a shape, a sticky note, an image or a text box, the elements that take a size. A free arrow or a stroke is left where it is, since its position is its ends and a free end is the reader's own drawing. Rejected: aligning the bounds of every element, which would move a free arrow's end by a box rule the reader never drew.
- **Align moves each box with the existing move.** Each box is moved through the move a drag uses, so an arrow bound to an aligned box is rerouted in the same edit. Rejected: a new align command in the core, which would copy the move and its reroute.
- **Align is to the selection's box.** The edge or centre aligned to is the one the selection's box has, so the reader sees the boxes meet the outline they framed. Rejected: aligning to the first element selected, which the selection does not record.
- **Distribute keeps the outer two in place.** The boxes between them are placed so every gap between neighbours is equal, which uses the total width of the boxes. Rejected: spacing the centres evenly, which gives unequal gaps when the boxes differ in size.
- **Distribute needs three boxes.** With two there is no gap to share, so the control is disabled, rather than doing nothing when pressed. Rejected: a control that is enabled and does nothing.
- **A selection stacks by its own order.** Bring forward moves the selection up past the next element above it that is not selected, so the selected elements keep their order among themselves. Rejected: moving each selected element one step on its own, which can swap two selected elements that sit side by side.
- **The stacking keys are the bracket keys with Cmd or Ctrl.** Cmd or Ctrl with the closing bracket brings the selection forward, with the opening bracket sends it backward, and holding Shift as well takes it to the front or the back, as the reference does. Rejected: keys without a modifier, which would collide with the letter keys of the tools.
- **The stacking keys are bound only with a selection.** They are registered with the selection's commands, so with nothing selected they do not fire.

## Risks and trade-offs

- Align and distribute leave an arrow and a stroke in a selection where they are, so a reader who selects them with boxes sees only the boxes move. The verdict's rows name boxes, and the arrows stay as drawn.

## Key files

| File                                                                               | Role                                                                                                |
| :--------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| `apps/web/app/components/Resource/Whiteboard/EditorPropertiesSeveralPanel.vue`     | the panel of a selection of several: the fill it shares, and now the align, distribute and stacking |
| `apps/web/app/components/Resource/Whiteboard/EditorPropertiesOrder.vue`            | the stacking of one element, whose four controls the selection's controls mirror                    |
| `apps/web/app/composables/whiteboard/useWhiteboardKeyboard.ts`                     | registers the stacking keys beside the selection's commands                                         |
| `apps/web/app/services/whiteboard/keyboard/constants.ts`                           | the command group the keys are registered under                                                     |
| `apps/web/app/services/whiteboard/gesture/getMoveOperations.ts`                    | the move of each element of a selection by one delta, which align and distribute reuse              |
| `apps/web/app/services/whiteboard/getSelectedElements.ts`                          | the selected elements with their indices, which align, distribute and stacking read                 |
| `apps/web/app/store/resource/whiteboard/index.ts`                                  | commits a command's operations as one edit                                                          |
| `apps/web/app/models/ui/UiIconMeaning.ts`                                          | the icon meanings the controls draw, with new meanings for the align and distribute controls        |
| `packages/vue-block-editor-headless/src/services/changePositionedElementZOrder.ts` | the z-order move of one element, which a selection's stacking repeats for each member               |
| `packages/vue-block-editor-headless/src/services/movePositionedElement.ts`         | the move of one element, rerouting the arrows bound to a moved shape in the same edit               |

New files, created by the change:

```text
apps/web/app/services/whiteboard/arrange/getAlignOperations.ts        the moves that line the boxes of a selection up at one edge or centre
apps/web/app/services/whiteboard/arrange/getDistributeOperations.ts   the moves that space the boxes of a selection with equal gaps
apps/web/app/services/whiteboard/arrange/getStackOperations.ts        the z-order moves that stack a selection, keeping its order
```

## Sources

- [Excalidraw](https://github.com/excalidraw/excalidraw): the reference for align, distribute and the stacking keys. Taken: the six align edges and the two distributions, named in packages/element/src/align.ts and packages/element/src/distribute.ts, and the stacking keys named in packages/excalidraw/actions/actionZindex.tsx. The rules for a selection's order and for the disabled controls are this design's.
