# PDF viewer reading modes

Horizontal, wrapped and page-by-page scrolling, one-page and two-page spreads, a presentation mode, a hand and a text selection tool, a properties dialog, and the Attachments and Layers sidebar views, as the reference viewer's menus hold them ([pdf.js viewer markup](https://raw.githubusercontent.com/mozilla/pdf.js/master/web/viewer.html)).

## Why not

The viewer is a dialog over a chat message that shows one attachment, and it reads a document top to bottom in one column. Scroll and spread modes are a way to read a book, and a message's attachment is read once and closed. The dialog's expand is already its full screen, so a presentation mode would be a second one. A page is dragged by its scroll and selected by the browser's own text selection, so a hand and a selection tool would switch between what the pointer already does. A properties dialog and the two extra sidebar views serve a document's author, not a reader of an attachment.
