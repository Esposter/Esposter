# Viewer

The viewer wraps the renderer's `PDFViewer`, together with its link service and find controller, and exposes them as refs and functions for the consumer's own container and elements. The package draws no chrome of its own. Pages, overlays, the outline and thumbnails are all state the consumer's elements read. Requirements live in [spec.md](spec.md), next to this page.

## How it works

`usePdfViewer` creates the renderer's components on the consumer's container as soon as the container, the viewer's element and the renderer's viewer module exist, then applies whichever document is loaded. Events from the renderer are copied into refs, and the consumer's controls call plain functions.

- **Events update refs.** A page change writes `currentPageNumber`, a scale change writes `scale`, a rotation writes `pagesRotation`, and the find events write `matchesCount` and `isNotFound`.
- **Rendered pages are published as overlays.** Every page the renderer draws reports its element and viewport into `overlays`. The consumer positions its own elements on those pages, and maps rectangles from PDF space onto the page with the viewport's point conversion, the only conversion the renderer's typings declare.
- **Searching hands the query to the find controller.** Case and whole-word options come from refs. Terms supplied with the document are passed as a list, so every match of each term is highlighted when the document arrives.
- **Zoom is clamped and anchored.** Scale moves between the renderer's limits, and fit-to-width, fit-to-page and actual-size are separate actions. Two pointers on the container drive pinch zoom, and Ctrl with the wheel drives the same scaling, both listened to by `usePdfZoomGesture`. In both cases the scroll is recomputed by `getZoomedScroll` so the content under the pointer stays where it was.
- **The outline and the thumbnail rail come from the document.** The outline is read once when a document arrives and stored in `outline`. Choosing an entry goes through the link service. `usePdfThumbnails` creates one row per page, each drawn with `usePdfPage` only while the sidebar shows it, and sets `isCurrent` from the viewer's current page.
- **Canvases are sized for the screen.** `usePdfPage` renders at the canvas's on-screen width multiplied by the device pixel ratio, lowered if the area would exceed the device cap. A new width starts a new draw and the draw in flight is superseded.
- **Fullscreen mirrors the browser.** `toggleFullscreen` asks the container to enter or leave fullscreen, and `isFullscreen` is kept in step with the document's `fullscreenchange`, which also covers leaving through Escape.
- **Printing uses rendered images.** Each page is rendered to an image at the capped size, in batches, into a container that is hidden on screen and shown by print styles only. Every image stays in that container until `afterprint`, and the container is removed then, or when the owning scope ends during a print still in progress.
- **Download hands back the original file.** The bytes given to the renderer are saved under the caller's file name through the shared `downloadFile`, which defers revoking its object URL until the download has started.
- **A new document starts from the first page.** The renderer resets its page and rotation without an event, so `usePdfViewer` resets them with the match state when a document is applied.
- **Disposing ends the viewer's listeners.** The renderer gets one abort signal per viewer, and the viewer's own listeners share it. Disposing clears the document, then aborts the signal.

## Decisions

- **State and actions instead of components.** A styled viewer inside the package was rejected, because a toolbar with the package's own markup would have to be overridden by every consumer.
- **Overlay geometry comes from rendered pages.** The consumer is the one that knows what belongs on a page, so the viewer reports where each page sits and at what scale, and the consumer does the conversions.
- **The scroll under a pointer is computed here.** The renderer's own zoom keeps the current page in view and ignores the pointer, so the scroll is set by hand after the scale changes.
- **Thumbnails are a composable, not a component.** The rows belong to the consumer. The composable tracks them and draws only the ones in view, so the sidebar's appearance stays with the consumer.
- **A cleared viewer keeps its last document for search.** The find controller rejects an empty document, so clearing leaves the previous one attached until the next document loads.
- **Print renders every page to an image.** Printing the live page elements would only print the pages currently on screen, which is why each page is rendered separately.

## Key files

| File                                                               | Role                                                                                      |
| :----------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| `packages/vue-pdfjs-headless/src/composables/usePdfViewer.ts`      | The viewer's events as refs, and its search, outline, fullscreen, download and print      |
| `packages/vue-pdfjs-headless/src/composables/usePdfZoomGesture.ts` | Pinch and Ctrl-wheel zoom about the pointer, with its listeners under a signal of its own |
| `packages/vue-pdfjs-headless/src/composables/usePdfPage.ts`        | One page drawn into a canvas at its width, with the newest draw winning                   |
| `packages/vue-pdfjs-headless/src/composables/usePdfThumbnails.ts`  | One row per page, drawn while in view of the sidebar and marked when current              |
| `packages/vue-pdfjs-headless/src/services/getZoomedScroll.ts`      | The scroll that keeps a point's content in place as the scale changes                     |
| `packages/vue-pdfjs-headless/src/services/renderPrintSheets.ts`    | Every page rendered for print, in batches, into a print-only container                    |
| `packages/vue-pdfjs-headless/src/models/PdfPageOverlay.ts`         | A rendered page's element and its viewport                                                |

## Sources

- [mozilla/pdf.js, `web/pdf_viewer.js`](https://github.com/mozilla/pdf.js/blob/master/web/pdf_viewer.js): where the renderer's page container and its event bus are defined.
- [PDF.js API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html): the page viewport and its point conversion.
