# Survey Creator

The owner's editor for a survey, on the [typed document](../survey-document/design.md). It has the shape of the [page builder](../page-builder/README.md)'s editors for webpages and emails: a store of selection, history and the preview flag, commands that turn each gesture into one core edit, and panes drawn with the UI library. The edits are the headless block editor's tree commands, which return JSON Patch operations, and the history is the bounded one in `@esposter/shared`.

## How it works

A gesture reaches the Creator from the palette, a row of the layers tree, a shortcut or the toolbar. `useSurveyCreatorCommands` turns it into the operations of one core command, or into none when the core refuses it. `applyEdit` applies those operations through the survey's document schema, so an edit the schema refuses changes nothing. An applied edit commits the document and its history together, and undo and redo apply the patches a history entry holds. Each commit reaches the autosave, which runs the survey check before it saves.

```mermaid
flowchart TD
  GESTURE["palette, layers, shortcut or toolbar"] --> CMD["useSurveyCreatorCommands: one core command per gesture"]
  CMD --> OPS{"operations, or none when the core refuses"}
  OPS -->|none| REFUSED["nothing recorded"]
  OPS -->|operations| APPLY["applyEdit: applyBlockEdit against surveyDocumentSchema"]
  APPLY -->|"schema refuses"| REFUSED
  APPLY -->|"document and inverses"| COMMIT["commit: document and history together"]
  COMMIT -->|"undo or redo applies the entry's patches"| APPLY
  COMMIT --> AUTOSAVE["autosave: one save at a time, the latest document"]
  AUTOSAVE --> CHECK{"survey check in Editor.vue"}
  CHECK -->|"an issue"| ALERT["first issue alerted, nothing saved"]
  CHECK -->|"none"| SAVE["survey store saveDocument"]
```

## The editor

- **Shell.** `Shell.vue` lays out three panes. The left pane holds the Layers and Palette tabs. The centre holds the toolbar, then the canvas or, in Preview, the runner. The right pane holds the Properties, Logic and Theme tabs, which are the [properties](../survey-properties/design.md), [logic builder](../survey-logic-builder/design.md) and [theme and files](../survey-theme-files/design.md) parts. Both side panes resize through a handle. Below the small breakpoint one pane shows at a time as a tab, in the order Canvas, Structure (the palette above the layers), Properties, Logic and Theme. One component serves both layouts.
- **Store.** `useSurveyCreatorStore` holds the document, the history, the preview flag and the selection. The selection holds the selected node's id rather than its pointer, so an edit or an undo that moves the node keeps it selected; `selectedPointer` and `selectedNode` are read off the document as it stands. `load` replaces the document and clears the history and the selection. Selection is not history.
- **Commands.** Insert places a palette kind after the selected element. With nothing selected it goes to the end of the first page when that page takes the kind, and otherwise to the end of the pages. Move up, move down, move into the element before and move out after the parent each apply a core move. Move to a chosen place, duplicate and remove are the same kind of core command. Duplicate renames each question in the copy to a name no element holds. Remove moves the selection to the element focus falls on when the selected element goes. A property or root-prop edit is one core update. A refused command returns false and records nothing.
- **Shortcuts.** `Shell.vue` binds undo, redo and four Alt+arrow moves (up, down, into the element before, out of the parent) in the app's command scope while the Creator is mounted, whichever pane has focus.
- **Layers.** `Layers.vue` lists every node in layer order, each row indented by its depth and titled by its title, its name or its kind's label. Choosing a row selects it. A row dragged onto the top or bottom half of another row moves there through the move-to command, and the core refuses a slot that does not take the node's kind. The row menu offers Duplicate, Move to… and Remove. Move to lists each slot that takes the node, labelled by the titles of the nodes it sits under. Remove asks first. A move re-renders the row, and keyboard focus follows it.
- **Palette.** `Palette.vue` offers the question kinds and the content and layout kinds in four groups. Choosing one inserts it. Pages are added from the toolbar.
- **Canvas.** `Canvas.vue` draws each page as a heading over its elements. A question is drawn by its runner field with pointer events off and disabled. A panel is a bordered box over its children. A click, or Enter on a focused element, selects it, and the selected element takes an accent line inside its edge. The canvas moves nothing.
- **Toolbar.** `Toolbar.vue` holds undo, redo, Add page, Import, Export and Clear, then the Design or Preview switch. Import parses the file as JSON, runs the document schema and the survey check, and shows the first refusal as the pointer of its fault and its message. A file that passes replaces the content and the root props as one history entry. Clear replaces them with an empty survey after a confirmation. Export writes the document as a JSON file.
- **Preview.** The Design or Preview switch sets the preview flag. The workspace then draws `Runner.vue` in place of the canvas, on the current document, with a completion that does nothing, so no response is saved. The runner starts fresh each time it is shown.
- **Editor.** `Editor.vue` loads the stored document into the store when it opens and when a restore lands. It tracks the files the document references, autosaves through `useSurveyCreatorAutosave` and sweeps the files the document no longer references as it unmounts. The survey check runs before each save: an issue is alerted and nothing is saved, though the editor keeps the edit. Autosave runs as one queue under one key, so no two saves run at once, and an edit made during a save is written by the save after it.

## Decisions

- **Reorder lives in the layers tree.** Rejected: dragging on the canvas. A canvas drag needs hit-testing against rendered fields and a pointer-only path with a keyboard twin, when the layers tree already has both and is the page builder's model.
- **The palette inserts; it is not dragged.** Choosing a kind inserts it after the selection. Rejected: dragging a kind onto the canvas, for the reason above.
- **Edits are patches.** Rejected: replacing the whole document on every change, which makes undo a list of snapshots and makes an agent's edit a different path from the owner's.
- **Selection holds an id.** Rejected: a pointer, which every move changes. An id keeps the selected element selected through a move and through an undo.
- **The survey check gates the save, not each edit.** Rejected: refusing each edit that fails the check. A name clash exists only between two elements, so the edit that resolves a clash would be refused as well. The check is held where a document is written.

## Key files

| File                                                                   | Role                                                                                       |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `apps/web/app/components/Resource/Survey/Editor.vue`                   | the Editor blade: loads the document, autosaves through the check, sweeps files on unmount |
| `apps/web/app/components/Resource/Survey/Creator/Shell.vue`            | the three panes, the narrow-screen tabs and the keyboard commands                          |
| `apps/web/app/components/Resource/Survey/Creator/Toolbar.vue`          | undo, redo, add page, import, export, clear and the Design or Preview switch               |
| `apps/web/app/components/Resource/Survey/Creator/Layers.vue`           | the layers tree: selection, drag and the row menu                                          |
| `apps/web/app/components/Resource/Survey/Creator/Palette.vue`          | the kinds the palette inserts                                                              |
| `apps/web/app/components/Resource/Survey/Creator/Canvas.vue`           | the canvas of pages                                                                        |
| `apps/web/app/components/Resource/Survey/Creator/CanvasNode.vue`       | one element on the canvas, selectable                                                      |
| `apps/web/app/components/Resource/Survey/Runner.vue`                   | the runner the preview draws                                                               |
| `apps/web/app/store/survey/creator.ts`                                 | the document, history, preview flag and selection                                          |
| `apps/web/app/composables/survey/useSurveyCreatorCommands.ts`          | one core command per gesture, applied as patches                                           |
| `apps/web/app/composables/survey/useSurveyCanvasSelection.ts`          | the bindings a canvas page and element take: drawn as chosen, chosen by a click or Enter   |
| `apps/web/app/composables/survey/useSurveyCreatorAutosave.ts`          | the autosave queue                                                                         |
| `apps/web/app/store/survey/index.ts`                                   | the save path the autosave goes through                                                    |
| `apps/web/app/services/pageBuilder/getRecordedHistory.ts`              | folds a run of edits to one prop into one history entry                                    |
| `apps/web/app/services/pageBuilder/constants.ts`                       | the history size, the root pointer and the side pane widths                                |
| `packages/headless-block-editor/src/services/applyBlockEdit.ts`        | applies the patches and parses the result through the schema                               |
| `packages/headless-survey-engine/src/services/surveyDocumentSchema.ts` | the document schema every edit is parsed by                                                |
| `packages/headless-survey-engine/src/services/checkSurveyDocument.ts`  | the survey check the Editor runs before a save                                             |

## Not built

- The Alt+arrow moves are not read out through a live region. The layers tree is not a reorderable list, so nothing announces a move. The moved row keeps keyboard focus.
- Duplicate, remove and move to have no keyboard shortcut. They are reached through the row menu.
- The creator store and the files store are not keyed per resource. They hold one open survey at a time: the Editor sweeps its files before it unmounts, so a blade swapped for another survey does not carry the first survey's file set into the next.

## Notes

- A run of edits that writes the same prop of one node, or the same root props, continues the newest history entry, so typing a title one key at a time is one undo step. Consecutive writes to one list are one run as well: adding a choice and then moving it are undone together, since both write the node's `choices` prop. The cost is that one undo returns to before the whole run.
