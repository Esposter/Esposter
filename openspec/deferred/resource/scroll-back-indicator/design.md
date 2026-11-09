# Scroll-back-to-content indicator

A floating control that appears when the content is off screen and brings the view back to it.

## Why deferred

The [navigation change](../../../changes/archive/2026-11-09-resource-whiteboard-canvas-and-navigation/design.md) deferred the indicator until wheel panning was in use, and that change has built panning: the wheel pans, Space with a drag pans, and the view holds fit to content, which brings the content back in one press ([whiteboard](../../../specs/resource/whiteboard/design.md)). The indicator would be a second route to the same view. Its own case is a reader who loses the board after panning, and fit to content already answers that, so the indicator waits for a reader whose loss fit does not fix.

**Revisit when:** a reader reports losing the content of a board after panning, in a way fit to content does not fix.
