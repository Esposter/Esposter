# PDF viewer as a headless package

The PDF viewer's loading, page drawing and viewer state move into `vue-pdfjs-headless`, a published workspace package with no styling. The app's thumbnail and viewer keep only their look. The package then builds the features over a document's pages that the audit set aside, because a viewer package owes them even though the app's dialog draws none of them yet. Forms, annotations and comments are the [annotations change](../vue-pdfjs-headless-annotations/design.md).

## Scope

Today the viewer lives in the app. `apps/web/app/services/pdf/loadPdfDocument.ts` imports the renderer after mount and points it at the app's worker and the folders the server mounts. `apps/web/app/services/pdf/getCanvasScale.ts` caps a page's canvas. The thumbnail and the viewer components hold the rest: the draw cancelled by a newer one, the password prompt, the viewer's event bus, and the toolbar's page, zoom, rotation, search, download and print.

After the change:

- **`usePdfDocument`** takes a source and the renderer, and returns the document, its loading progress, the password prompt and the failure. It destroys the loading task on a source change or an unmount.
- **`usePdfPage`** draws one page of a loaded document, never a source, into a canvas the consumer renders, at the canvas's width times the pixel ratio, capped by area. A width change starts a fresh draw, which supersedes any draw still running.
- **`usePdfViewer`** builds the renderer's `PDFViewer`, `PDFLinkService` and `PDFFindController` for a loaded document on a container the consumer renders. It returns their state as refs and their actions as functions.
- **The app** keeps `apps/web/app/components/Pdf/Thumbnail.vue` and `apps/web/app/components/Pdf/Viewer.vue` as markup and tokens, the toolbar drawn with the UI library, and the folders the server mounts. The attachment loads its document once and passes it to both, where today the thumbnail and the dialog each parse the file.

The package's peers are `vue` and `pdfjs-dist`, the latter for types only. The renderer module itself is passed in.

## How it works

The split is the one `@vuetify/v0` makes under the UI library: state and actions here, every element the consumer's. Each composable takes the elements the consumer renders and returns refs and functions. None of them draws chrome.

```mermaid
flowchart TD
  consumer["consumer: the renderer module, its worker and data folders"] --> document["usePdfDocument(source)"]
  document -->|"onPassword"| password["password state: asked, or wrong and asked again"]
  document -->|"the load rejects"| failure["failure state, the load destroyed"]
  document -->|"resolved, one document"| page["usePdfPage: one canvas, newest draw wins"]
  document -->|"resolved, the same document"| viewer["usePdfViewer: PDFViewer, links and find on the consumer's container"]
  viewer --> state["refs: page, scale, rotation, matches, outline, fullscreen"]
  viewer --> actions["actions: go, zoom, rotate, find, download, print"]
  viewer -->|"a page is rendered"| overlay["each page's element and viewport, for overlays"]
```

- **The renderer is injected.** The consumer passes the renderer's module, its worker URL and the base URLs of its character maps, standard fonts and image decoders. The package never imports `pdfjs-dist` at runtime, so a consumer that needs older browsers passes the renderer's legacy build, and any bundler takes the package as plain ESM. The app passes the build it loads today, so its worker and API still come from one install.
- **Sources.** A source is a URL, bytes or a `File`, so opening a local file needs no second path. The renderer's loading parameters reach `getDocument` as given, which includes range loading, streaming and auto-fetch. Loading progress is a ref fed by the task's `onProgress`.
- **Pages for overlays.** The viewer reports each rendered page's element and viewport. A consumer then places its own elements over a page and converts a rectangle in PDF coordinates to the screen with that viewport. Area highlights use the same conversion.
- **Search and highlight.** Search drives the find controller, with case, whole words and the match count as refs. Highlighting a list of terms on load is a search over that list, with every match highlighted.
- **Zoom.** Zoom steps between the renderer's scale bounds, and fits to the width, the page or actual size. Pinch zoom reads two pointers on the container, and Ctrl with the wheel zooms the same way. Both scale about the point under the pointer.
- **Bookmarks and thumbnails.** The outline is the document's own, read once it loads, and following an entry goes through the link service. A thumbnail sidebar is `usePdfPage` over each page at the sidebar's width, drawn when its row comes into view, with the current page marked from the viewer's state.
- **Download and print.** Download saves the original bytes under the file's name. Print keeps the app's current approach: each page drawn to an image within the canvas cap, a batch at a time, in a container only print shows, which an unmount removes along with its print style.
- **Fullscreen** requests it on the container the consumer passed, and the ref follows `fullscreenchange`.

## Decisions

- **A headless package over app components.** [Dependency admission](../../specs/architecture/dependency-admission/design.md) names the state a viewer's controls drive as the example of a rewrite's own behaviour, and that state is what both wrappers were installed for. Leaving it in the app was rejected: a second Vue consumer of the renderer would write the loader, the draw cancelling and the find wiring again.
- **Composables over components.** Shipping styled `PdfThumbnail` and `PdfViewer` components was rejected, since a toolbar in the package's own markup is a look every consumer would have to override.
- **The renderer passed in over a renderer dependency.** Importing `pdfjs-dist` from the package was rejected. It would choose the build for every consumer and pin the package to the major it was built against, which is the version cost the [PDF viewer](../../specs/architecture/pdf-viewer/design.md) was rebuilt to remove. The renderer's types stay a peer, so a consumer's renderer major is checked against the package's.
- **The features are built, not deferred.** Twenty rows named the consuming app as their owner, which no dependency is, and the viewer's page set five more aside for now. Parity is measured against the upstream's surface rather than the dialog's, so all of them are built here and tested. The dialog keeps the controls it draws today.
- **One document passed to every view of it.** A cache in the package keyed by source was rejected: it would need its own count of who still reads a document before destroying it, while the attachment already holds the one place both its views read.
- **Annotations in a change of their own.** Building forms, annotations and comments here was rejected for size: they share one model, the annotation storage, apart from the pages this change draws, so they split cleanly.

## Key files

| File                                                         | Role after the change                                           |
| :----------------------------------------------------------- | :-------------------------------------------------------------- |
| `apps/web/app/components/Pdf/Thumbnail.vue`                  | The row's canvas over `usePdfPage`                              |
| `apps/web/app/components/Pdf/Viewer.vue`                     | The pages' container and the toolbar over `usePdfViewer`        |
| `apps/web/app/components/Message/Model/FileRenderer/Pdf.vue` | The attachment: the thumbnail, and the dialog on a click        |
| `apps/web/app/services/pdf/constants.ts`                     | The mounted folders' base URLs and the app's own print settings |
| `apps/web/configuration/nitro.ts`                            | The renderer's folders mounted from its install                 |
| `openspec/specs/architecture/pdf-viewer/design.md`           | The app's use of the package                                    |

The package itself:

```text
packages/vue-pdfjs-headless/src/composables/  usePdfDocument, usePdfPage, usePdfViewer, each with its test
packages/vue-pdfjs-headless/src/services/     the canvas scale, pinch zoom, print and download
packages/vue-pdfjs-headless/src/models/       PdfSource, PdfRenderer, PdfPageOverlay
openspec/specs/vue-pdfjs-headless/README.md   the area's index and both Upstream tables
```

## Notes

- The app's dialog changes nothing a reader sees. The new features reach the app only when a dialog draws their controls, and that is a product decision for the attachment, not this change.

## Sources

- [PDF.js API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html): `getDocument`'s parameters, range loading, streaming and auto-fetch among them.
- [mozilla/pdf.js — `src/display/api.js`](https://github.com/mozilla/pdf.js/blob/master/src/display/api.js): the loading task's `onPassword` and `onProgress`, which the API page lists without their members.
- [mozilla/pdf.js — `web/pdf_viewer.js`](https://github.com/mozilla/pdf.js/blob/master/web/pdf_viewer.js): the viewer component and its events.
- [hrynko/vue-pdf-embed](https://github.com/hrynko/vue-pdf-embed) and [vue-pdf-viewer/vue-pdf-viewer](https://github.com/vue-pdf-viewer/vue-pdf-viewer): the trackers the Upstream tables judge.
