## Context

A text node is edited on the canvas by the note's editor, mounted inside the frame, and each change is one update-props edit of its content under the session's interaction id. The frame draws no toolbar, so the text editor has none. The note's writing kit is the menu bar in the note's own resource, which composes shared items: the text marks, the lists, the block items and the link control. The block items include a task list, and the menu bar adds table, image and alt text controls that are the note's own.

The node toolbar is an app-document control placed beside the selected node by the same placement the canvas uses for every node, so a control in the frame's document would be drawn without the app's styles.

## Gap analysis

| Feature                                   | Verdict                                                                                             |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Rich-text toolbar while editing [email]   | Built here: the text toolbar over the text, with the shared marks, blocks, lists and link control   |
| Rich-text toolbar while editing [webpage] | Built here, the same toolbar, since both editors edit a text node through the same canvas component |

## Decisions

- **The text toolbar takes the node toolbar's place while the text is edited.** A text edit shows one bar, so the node's move, duplicate and delete controls are not stacked over the text being typed into. The move handle is in the node toolbar, so it is not offered during the edit and returns with the node toolbar when the edit ends. The alternative was two bars stacked, which covers the first line of the text, and a second toolbar for the text beside the node's, which would be that stack under another name.
- **The toolbar reuses the note's items and link control.** The text marks, the lists, the block items without the task list, and the link control are the note's own components and item builders, so the two editors cannot drift apart. Bold and italic already came from a shared builder, and the menu bar defined Code inline, so Code moved into that builder beside them. The rich-text menu bar draws the same builder, so it gains a Code button between Italic and Strike; the note's menu bar draws it where it did. The task list is left out of the block builder by its `isTaskListOffered` option, since a text block takes none. Rejected: the whole note menu bar, since its table, image and alt text controls have no place on a text block. An email's text is a paragraph of words, and its images and tables are blocks of their own.
- **The toolbar is an app-document control placed beside the text.** It takes the node toolbar's placement, above the text when the canvas has room and below it when not. The alternative was a toolbar inside the frame, whose buttons and link popover would be drawn in the frame's document without the app's styles, which the canvas keeps out of the frame.
- **The canvas reads the text editor's editor through its exposed instance.** The text editor exposes the editor it holds, and the canvas reads it through a template ref, so the toolbar formats the text the frame's editor holds. Rejected: holding the editor in a store, which would keep a live editor instance in the state the store keeps beside the document.
- **The toolbar draws its items again from each transaction.** Tiptap keeps no reactive state of its own, so the toolbar redraws on every transaction, as the note's line count does. A mark's toggle, a block's change and a focus change each dispatch one, and the buttons that act on a selection are enabled only while the editor is focused.
- **The link control does not refuse an address.** The note's own control has never refused one, and the publish already drops an address whose scheme is not allowed, as it does for a note's link. A second scheme check in the control would be a second rule beside the publish's, so the control stays as the note has it.

## Rejected

- A bubble menu over a text selection. It shows only on a selection, so the link control is out of sight until words are selected, and it is a second toolbar beside the note's fixed one.
- The whole note menu bar over a text block, for the reasons above.

## Risks and trade-offs

- The toolbar's placement follows the frame's rect, read again on each scroll as the node toolbar's is, so a text near the frame's edge may move the bar below the text.
- The link popover opens in the app's document, so its address field is outside the frame and takes focus there, as the note's link popover does.

## Key files

| File                                                             | Role                                                                                                                             |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/app/components/PageBuilder/Canvas/Index.vue`           | the canvas, which draws the text toolbar in place of the node toolbar while a text is edited, and reads the text editor's editor |
| `apps/web/app/components/PageBuilder/Canvas/TextToolbar.vue`     | the text toolbar drawn over the text being edited: the note's block, mark and list items and the link control                    |
| `apps/web/app/components/PageBuilder/Canvas/TextEditor.vue`      | the text editor mounted in the frame, which exposes its editor for the text toolbar                                              |
| `apps/web/app/components/PageBuilder/Canvas/NodeToolbar.vue`     | the node toolbar, which the text toolbar takes the place of while the text is edited                                             |
| `apps/web/app/services/pageBuilder/getToolbarPlacement.ts`       | the placement the text toolbar shares with the node toolbar                                                                      |
| `apps/web/app/components/Resource/Note/EditorMenuBar.vue`        | the note's writing kit, whose shared items the text toolbar draws                                                                |
| `apps/web/app/components/Resource/Note/LinkMenuButton.vue`       | the link control the text toolbar reuses                                                                                         |
| `apps/web/app/services/richTextEditor/getTextFormatMenuItems.ts` | the text marks the text toolbar and the rich-text bar offer, bold, italic and code                                               |
| `apps/web/app/services/richTextEditor/getListMenuItems.ts`       | the bullet and numbered list items the toolbar offers                                                                            |
| `apps/web/app/services/resource/note/getNoteBlockMenuItems.ts`   | the note's block items, paragraph, headings, task list and blockquote, of which the toolbar takes all but the task list          |
| `apps/web/shared/services/resource/note/getNoteExtensions.ts`    | the extension set the text editor is built on, which the toolbar's marks must match                                              |

## Sources

- [GrapesJS — Rich text editor](https://github.com/GrapesJS/grapesjs/blob/dev/docs/api/rich_text_editor.md) — the `rte.add` method adds actions such as a link to the built-in toolbar, and the page lists no default link action, so the link control is a reference for an added action rather than a default one.
