## 1. The package

- [x] 1.1 Create `vue-pdfjs-headless` by the file-organization skill's new-package recipe. Build `usePdfDocument` over an injected renderer, moving the loader's and the canvas scale's tests into its suite. Verify: tests titled "Opening with the right password", "A wrong password asks again", "A file that is not a PDF", "Changing the source mid-load" and "Unmounting mid-load", written first, and the package's own suite green with its size snapshot.
- [ ] 1.2 Build `usePdfPage` and `usePdfViewer`, moving the thumbnail's and the viewer's state tests into the package. The attachment loads one document and passes it to both its thumbnail and its dialog. The app's copies of the canvas area, scale, rotation and print constants leave `apps/web/app/services/pdf/constants.ts` in the same step as their imports switch to the package, so each value has one source. Verify: tests titled "A page drawn on a high-density screen", "#52 A page too large for the device's canvas", "#20 A width change while a page is drawing", "Zooming in at the largest scale", "Fitting a page to the width", "#61 Searching for a word shows the match count", "A word that is not in the document", "Downloading a document under its name", "Printing a document" and "Unmounting while a print is drawing", and `pnpm test app/components/Pdf app/components/Message/Model/FileRenderer/Pdf.test.ts --run` from `apps/web` passing.

## 2. What the trackers asked for

- [ ] 2.1 The renderer's legacy build, or any other, taken from the consumer. Verify: tests titled "#125 Loading through a legacy renderer build" and "#32 The package's build holds no renderer".
- [ ] 2.2 Loading progress as state. Verify: a test titled "#69 #70 Loading progress rises to the whole file".
- [ ] 2.3 Each rendered page's element and viewport for overlays, and area highlights through the viewport. Verify: tests titled "#84 #56 Placing an overlay on a page" and "#26 Highlighting an area of a page".
- [ ] 2.4 Pinch zoom and Ctrl with the wheel, about the pointer. Verify: a test titled "#223 Pinching to zoom".
- [ ] 2.5 The renderer's loading parameters as given, and a URL, bytes or a `File` as the source. Verify: tests titled "#227 #67 Loading parameters reach the renderer as given" and "Opening a local file".
- [ ] 2.6 A list of terms highlighted on load. Verify: a test titled "#24 Highlighting a list of terms on load".
- [ ] 2.7 The outline as bookmarks, and the thumbnail sidebar. Verify: tests titled "#44 Following a bookmark", "A document with no outline" and "The thumbnail sidebar marks the current page".
- [ ] 2.8 Fullscreen on the consumer's container. Verify: a test titled "Leaving fullscreen with the Escape key".

## 3. Records

- [ ] 3.1 Write the document and viewer capabilities' designs as built, and move both Upstream tables off the PDF viewer's page into the area's `README.md`, re-judging the rows built here. The PDF viewer's page then covers only the app's side, and the package joins the repo's package index. Verify: the spec suites pass, run as `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/workspace/staleNames.test.ts src/workspace/duplicateProse.test.ts src/services/openspec`.
