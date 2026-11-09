# Embed element

An element that shows a live web page or a video from another site inside the board.

## Why deferred

The export is drawn from the model, and neither format is captured from the page ([whiteboard](../../../specs/resource/whiteboard/design.md)). An embed is a live page from another origin, so the PNG and the SVG would carry a placeholder or nothing, where every other element draws in both files. Showing a foreign page also needs a sandbox and a list of addresses the embed may load, and the app has designed neither for a board. The embed would be a kind of element the export cannot draw, which is why it waits for a sandboxed design.

**Revisit when:** a sandboxed embed design, with its address list, is written and passes security review.
