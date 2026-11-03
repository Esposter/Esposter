# Viewer Chrome

The viewer's state for the controls a consumer draws around the pages, which the headless package returned until nothing read it: the document's outline as bookmarks, a rail of thumbnails for the pages in view, fullscreen, the rotation the viewer reported, and the scale as a zoom readout.

None of it is in the package now. The app's dialog draws the page, zoom, fit, search, rotate, download and print controls, which read what the viewer returns, and no outline, thumbnail rail or fullscreen control.

## Why deferred

- No UI draws it. Each of these members was returned by the viewer and read by no consumer, and the package carries only what the viewer uses.
- The rotate action stays, since the viewer uses it. What was cut is the rotation as state a consumer reads, which the viewer tracked only to report it.

## What it held

- The outline and "followBookmark": the document's outline, read when a document arrives and stored as state, and the link service's jump to an entry's destination. A document with no outline held an empty list.
- The thumbnails: "usePdfThumbnails" drew one row per page with `usePdfPage` only while the sidebar showed it, marked the current page from the viewer's page, and "PdfThumbnail" was its row. `usePdfPage` took an "isVisible" option for this and for nothing else.
- Fullscreen: "isFullscreen" was kept in step with the document's fullscreen change, and "toggleFullscreen" asked the consumer's container to enter or leave it.
- The rotation: "pagesRotation" was the rotation the renderer reported through its rotation event.
- The scale: the zoom-in control reads the scale internally, and the viewer also returned it as state for a zoom readout.

## Revisit when

The viewer draws an outline, a thumbnail rail, fullscreen, a rotation readout or a zoom readout. Reviving it moves this folder into `openspec/changes/`, and the members return to the viewer's state.

## Not the same thing

- The [viewer](../../../specs/vue-pdfjs-headless/viewer/design.md) builds what it draws: pages, zoom, search, download, print, and the rotate action.
- The [annotation UI](../annotation-ui/design.md) holds the page overlays a consumer places its own marks on, which the viewer published for that purpose and no surface drew.
