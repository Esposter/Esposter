# PDF viewer features not taken

Features of the reference viewer that the PDF viewer does without, one section each. The first four are controls on its primary bar that an existing affordance already covers, and the last two are a reading mode set and signing, which a chat attachment does not need.

## Fit width button

A control on the PDF viewer's primary bar that fits the pages to the width of the view.

**Why not:** The zoom readout is the reset, and it returns the scale to the one a document opens in, which fits the document to the container. A reader who wants the page back in view already has that route in the readout, so a Fit width control beside it would hold a second route to a fit and spend the bar's width on it.

## Full screen menu item

A Full screen item in the PDF viewer's More menu, which makes the viewer's root full screen through the browser's full screen API.

**Why not:** The viewer is hosted only by a dialog that expands over the screen, and the expand keeps the toolbar and the sidebar in view. A menu item would reach the same state through a second route, which the viewer does not need. The dialog's expand is the one full-screen control, so the menu does not repeat it.

## Page field Go button

A button beside the page field on the PDF viewer's primary bar that goes to the page typed there.

**Why not:** The page field commits on Enter, so a Go button beside it is a second control for one job. The field is the one place a page number is typed, and Enter is the key a reader already uses to commit a value, so the button would only repeat that key and add a target to the bar. The bar holds the controls every session uses, and a repeat of one of them does not earn a place on it.

## Text zoom buttons

Zoom out and zoom in drawn as text buttons, a minus and a plus, with the zoom readout between them on the PDF viewer's primary bar.

**Why not:** Text buttons read as separate controls, so a minus, a readout and a plus read as three controls. The icon pair with the readout between them reads as one zoom control, which is the task the pair serves.

## Reading modes

Horizontal, wrapped and page-by-page scrolling, one-page and two-page spreads, a presentation mode, a hand and a text selection tool, a properties dialog, and the Attachments and Layers sidebar views, as the reference viewer's menus hold them ([pdf.js viewer markup](https://raw.githubusercontent.com/mozilla/pdf.js/master/web/viewer.html)).

**Why not:** The viewer is a dialog over a chat message that shows one attachment, and it reads a document top to bottom in one column. Scroll and spread modes are a way to read a book, and a message's attachment is read once and closed. The dialog's expand is already its full screen, so a presentation mode would be a second one. A page is dragged by its scroll and selected by the browser's own text selection, so a hand and a selection tool would switch between what the pointer already does. A properties dialog and the two extra sidebar views serve a document's author, not a reader of an attachment.

## Signatures

Signing a document with a typed, drawn or imaged signature, and showing a digital signature's properties, as the reference viewer's editor does ([pdf.js viewer markup](https://raw.githubusercontent.com/mozilla/pdf.js/master/web/viewer.html)).

**Why not:** A signature is an act with legal weight, and a drawn mark on a rendered page proves nothing about who made it or that the file was not changed after. A digital signature needs a certificate and a signing service, which a chat attachment viewer does not have. A reader who must sign a document does it in a tool made to hold that proof and sends the result as a new attachment.
