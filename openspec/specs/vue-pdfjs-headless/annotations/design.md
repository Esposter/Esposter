# PDF annotations in the headless package

[`vue-pdfjs-headless`](../README.md) gains what a document holds besides its pages: forms, free texts and comments. The renderer's annotation storage holds the first two as they are filled or drawn, and one save writes that storage into the bytes a download carries. The requirements are in [spec.md](spec.md).

## Built

- **`usePdfAnnotations`** takes the viewer and the document `usePdfViewer` and `usePdfDocument` return. It sets the editor mode, reports each drawn annotation, lists comments, and imports and exports XFDF free texts through the storage.
- **XFDF** is read and written by `readXfdf` and `writeXfdf`, which the package exports from its barrel, framework-free and renderer-free. It carries free texts only.
- **The download** `usePdfViewer` returns saves through the renderer once the storage holds an entry or a watermark is set. The watermark is stored for that save alone.

## What the renderer saves

These are pdf.js behaviours at the version the workspace catalog pins, probed in Node with its legacy build, because the storage's rules belong to the renderer and not to the package:

| Entry                          | Storage key                          | Result on save and reload                                                                                          |
| :----------------------------- | :----------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| A form value                   | the widget's raw id, e.g. `4R`       | Kept, but only when the field carries `/NeedAppearances`; without it the worker returns before it writes the field |
| A free text                    | `pdfjs_internal_editor_` plus the id | Kept as a `FreeText` annotation                                                                                    |
| A text annotation (a comment)  | the same prefix, `annotationType` 1  | Dropped: the worker's save has no branch that writes one                                                           |
| Several free texts in one save | as above                             | Kept, every one reloads, but pdf.js logs `Object already resolved` as an unhandled rejection, one page or many     |

An untouched document's storage is empty, so "the storage has changed" is its size being above zero.

## Decisions

- **Comments are listed, not added.** The renderer's save drops text annotations. Writing them with a second PDF library was rejected, for the reason XFDF was not given one: the renderer's storage is the model, and a comment written outside it would not reach the download. Adding a comment is therefore not offered, and the package's spec says so.
- **No subpath for XFDF.** No package imports XFDF alone, and a second build entry would bundle `readXfdf` and `writeXfdf` a second time. The functions ship from the package's barrel.
- **The change event names a drawing, and only a drawing.** pdf.js calls its storage hook with the mode of an editor it has just stored, and gives no page. The page comes from the newest storage entry, which is that editor. Removing an editor and filling a form report no event, though a download still carries both.
- **XFDF carries free texts.** Ink, highlight, stamp and comments are not written or read. XFDF does not name the colour or size of a free text, so an imported one takes the renderer's defaults.
- **Imports are keyed apart from drawn editors, and a page past the end is refused.** pdf.js numbers its editors from zero, so an imported free text named `0` would replace the first drawn annotation; imports are stored under their own key namespace instead. A free text on a page that does not exist makes the renderer's save fail for the whole download, so the import checks the page count before it stores anything. A drawn editor has no element id until a page saves it, so the export takes its id from the key the renderer stores it under.
- **Reading XFDF returns a `Result`.** A file that is not well-formed, or a free text with no valid page or rectangle, returns an error that names the problem and imports nothing.
- **The watermark is written at save, not drawn on screen.** Drawing it into the page canvas was rejected: the mark would never reach the downloaded file, which is where a watermark is for. It is stored on every page before the save and removed after it, so the pages on screen never hold it.
- **The editor mode is the renderer's, applied when a document loads.** The renderer resets its mode with its document, so the mode is set again on each load.

## Known limits

- **A form value survives a download only when the field carries `/NeedAppearances`.** The spec's forms requirement promises every typed value is kept, but the renderer's save returns before it writes a field without that flag (see the probe table). The test `#268 Filling a form and downloading it` mocks `saveDocument`, so it passes whether or not the value survives, and it never sets the flag. Resume: a decision between two paths. Either the package sets `/NeedAppearances` on the document's form before the save, which changes the saved bytes of every form, or the spec's requirement is narrowed to the fields that carry the flag. Then the test either checks the saved value against a real document or the requirement's wording changes with it.
- **Comments cannot be added.** The renderer's save drops text annotations (see Decisions). Resume when pdf.js writes them on save: on each pdf.js bump, rerun the probe that stores a text annotation entry and reloads the file. If it survives, add `addComment` and a requirement for it in the spec.
- **Several free texts in one save log a pdf.js error.** The saved bytes reload with every free text, but pdf.js logs `Object already resolved` as an unhandled rejection. Resume: the user files it upstream by hand, with a reproduction (two free texts in one `saveDocument` call on pdf.js 6.4.299, run with the legacy build in Node), and the issue is linked here.
- **The browser check is open.** A drawn free text's export and the watermark's grey have not been seen in a browser. The export was checked against pdf.js's source and a stub, not a run. Resume: a harness page that mounts `usePdfAnnotations` and `usePdfViewer` in a browser test with the renderer's worker, draws one free text, exports it, and reads the saved file's FreeText annotation and its colour back with pdf.js. The app's PDF viewer draws none of these controls, so no existing page drives them.
- **The upstream rows are not re-judged.** The annotation issues on both trackers have not been read against this capability. Resume: `gh issue view` each annotation issue on the two trackers, judge it against this change, and update the package page's Upstream table.

## Key files

The package's annotation files:

```text
packages/vue-pdfjs-headless/src/composables/usePdfAnnotations.ts  editor mode, change events, comments, XFDF import and export
packages/vue-pdfjs-headless/src/xfdf/                             readXfdf and writeXfdf, framework-free
packages/vue-pdfjs-headless/src/services/getDownloadBytes.ts      original bytes, or the saved bytes with a watermark stored for the save
packages/vue-pdfjs-headless/src/services/createFreeTextEntry.ts   the storage entry the renderer saves as a free text
packages/vue-pdfjs-headless/src/models/                           PdfAnnotationChange, PdfAnnotationsState, PdfComment, PdfEditorMode, PdfFreeText, PdfFreeTextEntry
```

| File                                                            | Role                                                                                 |
| :-------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| `packages/vue-pdfjs-headless/src/composables/usePdfViewer.ts`   | the editor mode applied to the renderer, and the download through `getDownloadBytes` |
| `packages/vue-pdfjs-headless/src/composables/usePdfDocument.ts` | the document whose annotation storage `usePdfAnnotations` reads and writes           |
| `packages/vue-pdfjs-headless/package.json`                      | the `neverthrow` dependency for the XFDF results                                     |
| `openspec/specs/architecture/pdf-viewer/design.md`              | The app's PDF viewer, which draws none of these controls                             |

## Sources

- [mozilla/pdf.js — `src/display/api.js`](https://github.com/mozilla/pdf.js/blob/master/src/display/api.js): the document's `annotationStorage` and `saveDocument`.
- [mozilla/pdf.js — `web/pdf_viewer.js`](https://github.com/mozilla/pdf.js/blob/master/web/pdf_viewer.js): the viewer's annotation mode, forms included, and its annotation editor modes.
- [ISO 19444-1, XML Forms Data Format](https://www.iso.org/standard/74272.html): the XML format for a PDF's annotations and form data.
