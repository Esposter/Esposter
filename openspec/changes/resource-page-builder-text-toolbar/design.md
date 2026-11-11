## Context

A text node is edited on the canvas by the note's editor, mounted inside the frame, and each change is one update-props edit of its content under the session's interaction id. The frame draws no toolbar, so the text editor has none. The note's writing kit is the menu bar in the note's own resource, which composes shared items: the text marks, the lists, the block items and the link control. The block items include a task list, and the menu bar adds table, image and alt text controls that are the note's own.

The node toolbar is an app-document control placed beside the selected node by the same placement the canvas uses for every node, so a control in the frame's document would be drawn without the app's styles.

## Gap analysis

| Feature                                   | Verdict                                                                                             |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Rich-text toolbar while editing [email]   | Built here: the text toolbar over the text, with the shared marks, blocks, lists and link control   |
| Rich-text toolbar while editing [webpage] | Built here, the same toolbar, since both editors edit a text node through the same canvas component |

## Decisions

- **The node toolbar is shared with another change.** [Canvas overlays](../resource-page-builder-canvas-overlays/design.md) adds a move handle to the same node toolbar that this change places beside the text, so the two land in either order and the later one rebases. Rejected: a second toolbar for the text, which would stack two bars over one node.
- **The toolbar reuses the note's items and link control.** The text marks, the lists, the block items without the task list, and the link control are the note's own components and item builders, so the two editors cannot drift apart. Bold and italic already come from a shared builder, and the menu bar defines the other marks inline, so the first step is to lift those into the builder beside them. The alternative was a toolbar of its own, which would be a second list of the same marks. Rejected: the whole note menu bar, since its table, image and alt text controls have no place on a text block. An email's text is a paragraph of words, and its images and tables are blocks of their own.
- **The toolbar is an app-document control placed beside the text.** It takes the node toolbar's placement, above the text when the canvas has room and below it when not. The alternative was a toolbar inside the frame, whose buttons and link popover would be drawn in the frame's document without the app's styles, which the canvas keeps out of the frame.
- **The toolbar replaces the node toolbar while the text is edited.** A text edit shows one bar, so the node's move, duplicate and delete controls are not stacked over the text being typed into. The alternative was two bars stacked, which covers the first line of the text.
- **The link control does not refuse an address.** The note's own control has never refused one, and the publish already drops an address whose scheme is not allowed, as it does for a note's link. A second scheme check in the control would be a second rule beside the publish's, so the control stays as the note has it.

## Rejected

- A bubble menu over a text selection. It shows only on a selection, so the link control is out of sight until words are selected, and it is a second toolbar beside the note's fixed one.
- The whole note menu bar over a text block, for the reasons above.

## Risks and trade-offs

- The toolbar's placement follows the frame's rect, read again on each scroll as the node toolbar's is, so a text near the frame's edge may move the bar below the text.
- The link popover opens in the app's document, so its address field is outside the frame and takes focus there, as the note's link popover does.

## Key files

| File                                                             | Role                                                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `apps/web/app/components/PageBuilder/Canvas/TextEditor.vue`      | the text editor mounted in the frame, which the toolbar's controls act on             |
| `apps/web/app/components/PageBuilder/Canvas/NodeToolbar.vue`     | the node toolbar, which the text toolbar takes the place of while the text is edited  |
| `apps/web/app/services/pageBuilder/getToolbarPlacement.ts`       | the placement the text toolbar shares with the node toolbar                           |
| `apps/web/app/components/Resource/Note/EditorMenuBar.vue`        | the note's writing kit, whose shared items the text toolbar draws                     |
| `apps/web/app/components/Resource/Note/LinkMenuButton.vue`       | the link control the text toolbar reuses                                              |
| `apps/web/app/services/richTextEditor/getTextFormatMenuItems.ts` | the text marks the toolbar offers                                                     |
| `apps/web/app/services/richTextEditor/getListMenuItems.ts`       | the bullet and numbered list items the toolbar offers                                 |
| `apps/web/app/services/resource/note/getNoteBlockMenuItems.ts`   | the paragraph, heading and blockquote items the toolbar offers, without the task list |
| `apps/web/shared/services/resource/note/getNoteExtensions.ts`    | the extension set the text editor is built on, which the toolbar's marks must match   |

## Sources

- [GrapesJS, Rich text editor](https://github.com/GrapesJS/grapesjs/blob/dev/docs/api/rich_text_editor.md) — the rich text actions, which include a link action, taken as the reference for a link control on a text block.
