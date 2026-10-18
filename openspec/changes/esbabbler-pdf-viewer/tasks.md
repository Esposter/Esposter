## 1. Loading and the thumbnail

- [ ] 1.1 Write the loader and the thumbnail's tests first and see them fail: the scenarios 'The row changes width', 'A page larger than the device can draw' and 'The file cannot be fetched', with the upstream issue titles #20, #52, #28 and #261 the design names. Verify: `pnpm test app/components/Pdf app/services/pdf --run` from `apps/web` reports them failing.
- [ ] 1.2 Build `loadPdfDocument`, the canvas scale function and `PdfThumbnail`, and draw the row's first page with it. Verify: the same command passes.

## 2. The viewer

- [ ] 2.1 Build `PdfViewer` over `PDFViewer`, `PDFLinkService` and `PDFFindController`, with the password prompt and the load error, and mount it in the dialog. Verify: `pnpm test app/components/Message/Model/FileRenderer/Pdf.test.ts --run` from `apps/web` passes with the scenarios 'Opening the viewer' and 'A preview opens nothing'.
- [ ] 2.2 Build the toolbar: page, zoom and fit, search with the match count, rotate, download and print. Verify: a test per control's wiring in the viewer's suite, written first and failing, then passing.

## 3. The removal

- [ ] 3.1 Remove both PDF packages, the `pdfjs-dist` override and every config entry the design lists, mount the renderer's data folders from its install in place of the committed character maps, and sweep the residue. Verify: neither package name appears in `apps/web`, `pnpm-workspace.yaml` or `pnpm-lock.yaml`, and `pnpm test configuration --run` from `apps/web` passes.
- [ ] 3.2 Write the capability's design as built, with both Upstream tables, and archive this change. Verify: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/workspace/staleNames.test.ts src/services/openspec` passes.
