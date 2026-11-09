## Why

A text block on the canvas can be edited, but while it is edited nothing shows the formatting. The marks work only from the keyboard, and a link cannot be added at all. The note's writing kit has the toolbar these need, so an author in an email or a page meets a text editor that is weaker than the note beside it.

## What Changes

- Editing a text block shows a toolbar over the text, with bold, italic, code, the paragraph and headings one to three, bullet and numbered lists, blockquote and a link control.
- The toolbar takes the place of the node toolbar while the text is edited, and goes when the edit ends.
- The link control links the selected words, and clearing its address removes the link.

## Capabilities

### Modified Capabilities

- `resource/page-builder/canvas`: a text being edited shows a formatting toolbar, and its controls format the selected words.

## Impact

The toolbar draws the note's own items and link control, so the two editors share one set of controls. The note's menu bar keeps its table, image, task list and alt text controls, which a text block does not take. The text edit's one history entry per session is unchanged.
