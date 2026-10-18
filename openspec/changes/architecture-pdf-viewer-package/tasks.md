## 1. The package

- [ ] 1.1 Create `vue-pdfjs-headless` by the file-organization skill's new-package recipe. Build `usePdfDocument` over an injected renderer, moving the loader's and the canvas scale's tests into its suite. Verify: the package's own suite is green, its size snapshot included, and nothing in its build imports `pdfjs-dist` at runtime.
- [ ] 1.2 Build `usePdfPage` and `usePdfViewer`, moving the thumbnail's and the viewer's state tests into the package. The app's components render the composables' state. Verify: the package suite and `pnpm test app/components/Pdf app/components/Message/Model/FileRenderer/Pdf.test.ts --run` from `apps/web` pass.

## 2. What the trackers asked for

- [ ] 2.1 The renderer's legacy build, or any other, taken from the consumer. Verify: tests titled "#125 …" and "#32 …".
- [ ] 2.2 Loading progress as state. Verify: tests titled "#69 …" and "#70 …" in the embed rows.
- [ ] 2.3 Each rendered page's element and viewport for overlays, and area highlights through the viewport. Verify: tests titled "#84 …", "#56 …" and "#26 …".
- [ ] 2.4 Pinch zoom and Ctrl with the wheel, about the pointer. Verify: a test titled "#223 …".
- [ ] 2.5 The renderer's loading parameters as given, and a URL, bytes or a `File` as the source. Verify: tests titled "#227 …" and "#67 …", and one opening a local file.
- [ ] 2.6 Forms filled through the annotation layer, and saved. Verify: a test titled "#268 …".
- [ ] 2.7 A list of terms highlighted on load. Verify: a test titled "#24 …".
- [ ] 2.8 The outline as bookmarks, and the thumbnail sidebar. Verify: a test titled "#44 …" for the bookmarks and one for the sidebar marking the current page.
- [ ] 2.9 The annotation editor modes, their change events and XFDF export and import. Verify: tests titled "#61 …", "#68 …" and "#69 …" in the viewer rows, and the `/xfdf` round trip.
- [ ] 2.10 Comments listed and added as text annotations. Verify: a test titled "#75 …".
- [ ] 2.11 A watermarked download, and a download of the edited bytes once anything changed. Verify: a test titled "#37 …".
- [ ] 2.12 Fullscreen on the consumer's container. Verify: a test that the ref follows `fullscreenchange`.

## 3. Records

- [ ] 3.1 Move both Upstream tables off the PDF viewer's page into `vue-pdfjs-headless`'s own README, beside its requirements, re-judging the rows built here. The PDF viewer's page then covers only the app's side, and the package joins the repo's package index. Verify: the spec suites pass, run as `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/workspace/staleNames.test.ts src/workspace/duplicateProse.test.ts src/services/openspec`.
