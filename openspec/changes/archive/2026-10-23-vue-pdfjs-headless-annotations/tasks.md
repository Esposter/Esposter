## 1. Annotations

- [x] 1.1 Forms filled through the annotation layer and kept on save. Verified: "#268 Filling a form and downloading it" (usePdfViewer.test.ts). The value's survival in the saved bytes was probed against pdf.js 6.4.299 with a hand-built field carrying `/NeedAppearances`.
- [x] 1.2 `usePdfAnnotations` with the editor modes and their change events. Verified: "#68 Switching the editor mode" (usePdfViewer.test.ts) and "#61 Drawing reports a change" (usePdfAnnotations.test.ts). Removing an editor reports nothing, which is tested too.
- [~] 1.3 Comments listed; adding is not built. Verified: "#44 Listing a document's comments" and "A document with no comments". "#75 Adding a comment on a page" is dropped: the renderer's save writes no text annotation (probed), so the comment would not reach a download. Recorded in the spec and design.
- [x] 1.4 The `/xfdf` subpath. Verified: "#69 An XFDF round trip" (xfdf.test.ts, and the composable's round trip into a storage) and "Importing XFDF that is not well formed" (usePdfAnnotations.test.ts, storage unchanged). The subpath is built as `dist/xfdf.js`.
- [x] 1.5 The edited and watermarked download. Verified: "#37 A watermarked download" (every page's entry at save, none left after) and "An unedited document downloads its original bytes" (usePdfViewer.test.ts). A production-shaped save was probed against real pdf.js on six pages, and all six carry the watermark on reload.

## 2. Records

- [x] 2.1 The annotations capability's design is written as built (design.md, with the probes behind each storage rule). The Upstream rows are not re-judged here: the package page's annotation issue numbers collide with rows already there, and the trackers were not read from this session. The `#68` row's wording, that the download saves the original bytes, is out of date and is noted in the package page.
