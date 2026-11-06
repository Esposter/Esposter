# Keyboard

The page builder's keys. Each key the editor and the canvas take is a registered command: the shortcuts dialog lists it, the palette offers the ones that run, and `useCommands` binds each shortcut for as long as the surface that registered it is mounted. The [undo as patches](../undo-as-patches/design.md) design covers the commands the keys run, and the [document model](../document-model/design.md) holds the nodes they act on.

## The commands

| Key                                                        | Command                                                                          | Bound                       | Taken by                                       |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------- |
| `Delete`, `Backspace`                                      | delete the selected block, one command per key                                   | yes                         | the editor                                     |
| `cmd` with `C`, `X`, `V`                                   | copy, cut and paste the selected block                                           | yes                         | the editor                                     |
| `alt` with an arrow                                        | move the selected block down, up, out of its parent, or into the block before it | yes                         | the editor                                     |
| `cmd` with `Z`, `cmd` with `Shift` and `Z`, `cmd` with `Y` | undo and redo                                                                    | yes                         | the history, bound for the editor's whole life |
| `Enter`                                                    | edit the selected text                                                           | no, listed only             | the editor's shell                             |
| `ArrowDown`, `ArrowUp`, `Escape`                           | select the next block, the previous block or the parent                          | no, listed only             | the canvas's frame                             |
| `Escape` during a drag                                     | cancel the drag                                                                  | yes, only while a drag runs | the drag                                       |

`cmd` is Ctrl on Windows and Cmd on macOS, as the hotkey composable reads it.

**Enter and the canvas's arrows are listed, never bound.** A focused button or link takes Enter as its own activation, and a bound hotkey always prevents its default and cannot skip a control, so the shell takes Enter itself and passes over a control target. The arrows also walk the layers tree and the palette in the same window, so only the frame takes them.

**The frame is a document of its own.** The canvas is a sandboxed iframe, and a key pressed in it never reaches the window that `useCommands` binds on. So the frame takes its three keys itself and hands every other key to the editor, which presses it again on the window where the commands are bound. A key the frame hands on that a command takes prevents its default in the frame too, and a key no command takes keeps it. This hand-off is the one place the keys leave the library's mechanism, and it is kept to the single forward.

**A pending delete holds the editor's keys.** The node toolbar's Delete asks before it deletes, and while it asks the editor's commands are unbound, so a Delete pressed on its dialog cannot remove the node behind it. Undo and redo are not held: the history composable binds them for the editor's whole life.

**Text fields keep their keys.** The hotkey composable binds nothing while an input, a textarea, a rich-text editor or a textbox, combobox or spinbutton holds focus. A number field's arrow steps are its own key handling, since no command binds while a field has focus. The canvas's text edit ends its own Escape, and the frame hands on nothing from an editable target.

## Rejected

- **A keydown listener on the editor's shell for each key.** The shortcuts dialog cannot list a key that only a listener takes, and the palette cannot offer it. The shortcut is a command, so the listener is only kept for the one key that cannot be bound.
- **The arrows and Escape bound on the window while the frame has focus.** The window's arrows would be taken from the layers tree and the palette too, and a bound arrow prevents its default everywhere, so the frame keeps its own.
- **Enter bound as a command.** A bound hotkey skips nothing and prevents Enter's default, which takes a focused button's activation away. Skipping a control has no place in the hotkey mechanism, so the shell keeps Enter.

## Not built

- The canvas is a sandboxed frame, so its keys never reach the window where the commands bind. The frame keeps one listener for its arrows and Escape and hands every other key to the editor by dispatching it again on the window. That hand-off is the one step outside the commands mechanism.
- The two frame scenarios, "Arrow down in the frame selects the next node" and "Alt with an arrow in the frame is handed to the editor", have no unit test, because the test environment cannot tear down a loaded frame document cleanly. They wait for a package browser suite.

## Key files

| File                                                                    | Role                                                                                             |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `apps/web/app/composables/pageBuilder/usePageBuilderKeyCommands.ts`     | the editor's commands, the Enter that starts a text edit, and the frame's hand-off to the window |
| `apps/web/app/components/PageBuilder/Canvas/Index.vue`                  | the frame's arrows and Escape, the canvas's listed commands and the hand-off of every other key  |
| `apps/web/app/components/PageBuilder/Editor.vue`                        | the shell's Enter and the keys the composables register                                          |
| `apps/web/app/composables/pageBuilder/usePageBuilderEditor.ts`          | the delete confirmation's state, which the editor's keys wait on                                 |
| `apps/web/app/components/PageBuilder/Canvas/NodeToolbar.vue`            | the Delete button and the confirmation the editor's keys wait on                                 |
| `apps/web/app/composables/pageBuilder/usePageBuilderDrag.ts`            | the drag's Escape, bound only while a drag runs                                                  |
| `apps/web/app/composables/pageBuilder/usePageBuilderHistoryCommands.ts` | undo and redo                                                                                    |
| `apps/web/app/composables/pageBuilder/usePageBuilderMoves.ts`           | the Alt moves and the delete the editor's keys run                                               |
| `apps/web/app/composables/pageBuilder/usePageBuilderClipboard.ts`       | the copy, cut and paste the editor's keys run                                                    |
| `apps/web/app/composables/ui/useCommands.ts`                            | binds each command's shortcut for as long as its surface is mounted                              |
| `apps/web/app/util/dom/checkIsEditableTarget.ts`                        | the editable targets the canvas and the shell take no key from                                   |
