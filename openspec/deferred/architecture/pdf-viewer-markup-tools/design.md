# PDF viewer markup tools

Highlight, draw and image tools for the viewer's reader, as the reference viewer's editor buttons give ([pdf.js viewer markup](https://raw.githubusercontent.com/mozilla/pdf.js/master/web/viewer.html)).

## Why deferred

The viewer has one annotation tool, Add text, a mode the More menu marks while it is on, and each markup tool is another mode with its own colour and thickness controls. The renderer's save keeps highlights, drawings and images, but the XFDF exchange carries free texts only, so a marked-up document could be downloaded and not exchanged. A reader of a chat attachment who wants to point at a line has the message beside it.

## Revisit when

A reader asks to mark up an attachment and a reply in the message does not do, or the XFDF exchange carries more than free texts, so a markup reaches the file another reader opens.
