# Keyboard

The page builder's keys: one table names every key the canvas and the editor take, and the handler each key is offered to. The canvas's frame and the editor's shell both read that table through one lookup, so no key is mapped in two places. The [undo as patches](../undo-as-patches/design.md) design covers the commands the keys run, and the [document model](../document-model/design.md) holds the nodes they act on.

## The key table

Each row of the table is one key a handler takes: the key, the modifiers that must or must not be held, the scope it is offered to, and the action it takes. The rows of one scope take disjoint keys and modifiers, so the first row that matches is the only one.

| Key                                               | Modifiers                           | Scope  | Action                                                                                      |
| ------------------------------------------------- | ----------------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| `ArrowDown`, `ArrowUp`, `Escape`                  | no Alt, no Ctrl or Cmd              | Canvas | the next node, the previous node, the parent of the selected node                           |
| `c`, `x`, `v`                                     | Ctrl or Cmd                         | Editor | copy, cut, paste the selected node                                                          |
| `Enter`                                           | any, but not with a control focused | Editor | start a text edit on the selected text node                                                 |
| `ArrowDown`, `ArrowLeft`, `ArrowRight`, `ArrowUp` | Alt                                 | Editor | move the selected node among its siblings, out of its parent, or into the sibling before it |
| `Delete`, `Backspace`                             | no Alt                              | Editor | delete the selected node                                                                    |

The letters match in either case, and the Ctrl or Cmd modifier matches either key. A focused button or link takes Enter as its own activation, so an Enter there starts no edit.

## How the keys reach their handler

- **Text fields take no key.** A key pressed in an input, a textarea, a select or a content-editable element is taken by neither scope, so Delete and the arrows keep their meaning there.
- **The canvas takes its own keys and forwards the rest.** A key pressed in the frame is looked up in the canvas scope. A key it takes runs its selection command, and every other key is emitted to the editor, so a modified arrow or a Ctrl chord reaches the editor's handler. The frame is a separate document, so its keys never bubble to the editor's shell, and the forward is the only way they arrive.
- **The editor takes its keys from the shell and from the forward alike.** Its handler looks the key up in the editor scope, so a plain arrow keeps its meaning in the layers tree and the palette, where the canvas scope never reaches.
- **Enter keeps its default, and every other command prevents it.** Starting a text edit leaves the key's default in place, as the edit's own input takes over the focus.

## Key files

| File                                                              | Role                                                                                                |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `apps/web/app/services/pageBuilder/getKeyAction.ts`               | the key table and the one lookup both handlers call                                                 |
| `apps/web/app/models/pageBuilder/KeyAction.ts`                    | the command a key takes                                                                             |
| `apps/web/app/models/pageBuilder/KeyScope.ts`                     | the handler a key is offered to: the canvas or the editor                                           |
| `apps/web/app/models/pageBuilder/KeyBinding.ts`                   | one row of the key table                                                                            |
| `apps/web/app/components/PageBuilder/Editor.vue`                  | the editor's keydown, mapping each action it takes to its command                                   |
| `apps/web/app/components/PageBuilder/Canvas/Index.vue`            | the frame's keydown, which takes the canvas's keys and forwards the rest                            |
| `apps/web/app/composables/pageBuilder/usePageBuilderSelection.ts` | the next, previous and parent selection the canvas's keys move                                      |
| `apps/web/app/composables/pageBuilder/usePageBuilderFrame.ts`     | the frame's geometry: a node's element, the drop geometry of a palette drag, the toolbar's position |
| `apps/web/app/composables/pageBuilder/usePageBuilderMoves.ts`     | the Alt moves and the delete the editor's keys run                                                  |
| `apps/web/app/composables/pageBuilder/usePageBuilderClipboard.ts` | the copy, cut and paste the editor's Ctrl or Cmd keys run                                           |
| `apps/web/app/util/dom/checkIsEditableTarget.ts`                  | the text fields that take no key                                                                    |
