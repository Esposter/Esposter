# Whiteboard style copy and paste

A key pair copies one element's look and pastes it onto the selection, as the page builder copies a node's style and pastes it onto another node.

## Context

A whiteboard element holds its look as fields: an outline's colour, width and dash pattern, a shape's or sticky note's fill, a sketch level, a shape's corners, a text's size and its alignments, and an arrow's two arrowheads. The Properties panel sets each one through the whiteboard store's property update, so matching a second element to a first means setting every field again on it. The [positioned elements](../../specs/vue-block-editor-headless/positioned-elements/design.md) model already holds a rule for which kind takes which field, and the [page builder's style panel](../../specs/resource/page-builder/style-panel/design.md) already copies a node's style and pastes it onto another node through a pair of commands. This change gives the whiteboard the same pair, over the rule it already has.

## How it works

```mermaid
flowchart TD
  COPY["copy keys, one element selected"] --> LOOK["the look the element holds, as property changes"]
  LOOK --> STORE["session store: the copied look"]
  PASTE["paste keys, any selection"] --> GATE{"a look is copied"}
  STORE --> GATE
  GATE -->|no| NONE["no edit and no undo step"]
  GATE -->|yes| FAN["each selected element through the holding rule"]
  FAN --> EDIT["one edit, one undo step"]
```

The copy reads the one selected element into the session store, and writes nothing to the document. The paste is a gate: with no look copied it changes nothing. With one, every selected element receives the copied fields through the holding rule, and the operations of all of them are committed as one edit.

## Decisions

The decisions this change builds are recorded as built in `openspec/specs/resource/whiteboard/design.md`, under Decisions, and are not restated here.

## Notes

- **The chord matches the letter the key produces.** Vuetify 0 matches a shortcut by the key's produced letter, and on macOS the Option key changes the letter a key produces, so the pair is checked in a driven browser on macOS before it ships.

## Key files

| File                                                                                 | Role                                                                                                                      |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/app/components/Resource/Whiteboard/Editor/Index.vue`                       | mounts the style keys beside the stacking keys, over the same edit state and selection                                    |
| `packages/vue-block-editor-headless/src/services/updatePositionedElementProperty.ts` | exports its holding rule, so the copy reads a source's fields by the rule a paste applies to a target                     |
| `apps/web/app/services/whiteboard/getSelectedElements.ts`                            | reused: the selected elements in document order, the source of a copy and the targets of a paste                          |
| `apps/web/app/services/whiteboard/edit/applyWhiteboardEdit.ts`                       | reused: commits a paste's operations as one undo step                                                                     |
| `packages/vue-block-editor-headless/src/models/PositionedElementProperty.ts`         | reused: the change each copied field is held as, one per field                                                            |
| `apps/web/app/composables/whiteboard/useWhiteboardArrangeKeyboard.ts`                | reused as the pattern: a keys composable bound only while there is a selection and not while the delete confirmation asks |
| `apps/web/app/services/whiteboard/keyboard/constants.ts`                             | reused: the Whiteboard command group the keys are listed under                                                            |
| `apps/web/app/composables/ui/useCommands.ts`                                         | reused: registers the commands and binds each chord for as long as its command is registered                              |
| `apps/web/app/composables/pageBuilder/usePageBuilderStyle.ts`                        | reused as the pattern: a copied style held in a store, which a paste applies as one edit                                  |
| `apps/web/app/store/pageBuilder/styleClipboard.ts`                                   | reused as the pattern: the session store that holds the copied style across every open resource                           |

New code lands here:

```text
apps/web/app/store/resource/whiteboard/styleClipboard.ts              the copied look, held for the session
apps/web/app/services/whiteboard/style/constants.ts                   the copy and paste chords
apps/web/app/services/whiteboard/style/getWhiteboardStyle.ts          the look an element holds, as property changes
apps/web/app/services/whiteboard/style/getWhiteboardStyleOperations.ts the paste's operations over the selection
apps/web/app/composables/whiteboard/useWhiteboardStyleKeyboard.ts     registers the two commands
```

## Sources

The sources this change draws on are recorded in `openspec/specs/resource/whiteboard/design.md`, under Sources.
