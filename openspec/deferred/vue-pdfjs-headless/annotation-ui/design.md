# Annotation UI

The annotation editing the headless package carried before it was cut: the renderer's editor modes set and each drawing it reports, a document's comments listed, free texts exchanged as XFDF, and the page overlays a consumer places its own marks on.

None of it is in the package now. The "usePdfAnnotations" composable, the "readXfdf" and "writeXfdf" functions and their models are gone, the viewer has no editor mode, and it publishes no page overlay. The renderer's save still writes the form values, which are built and [described with the annotations](../../../specs/vue-pdfjs-headless/annotations/design.md).

## Why deferred

- No UI draws it. The app's PDF viewer shows a document's forms and draws no editor, comment list or XFDF control, so the package carried a surface that nothing read.
- A comment cannot reach a download. The renderer's save drops text annotations, so a comment added through the package would not survive the save, and the package offers none.
- XFDF carries neither the colour nor the size of a free text, so an annotation UI would need its own design for both before an exchange means anything.

## What it held

- The "usePdfAnnotations" composable took the viewer and the document. It set the renderer's editor mode, reported each drawing with its mode and page, listed the document's text annotations as comments, and imported and exported XFDF free texts through the renderer's storage. A drawing removed and a form filled reported nothing.
- The "readXfdf" and "writeXfdf" functions were framework-free and renderer-free. A file that was not well-formed, or a free text with no valid page or rectangle, returned an error that named the problem and imported nothing. An import checked the page count before it stored anything, since a free text past the last page would fail the whole save.
- The viewer's page overlays: each rendered page reported its element and its viewport, and the viewport converted a rectangle in PDF coordinates to the screen at any zoom, so a consumer could place its marks on a page.

## Revisit when

A PDF annotation UI is designed: a surface in the app that edits or draws annotations, lists a document's comments, or exchanges XFDF. Reviving it moves this folder into `openspec/changes/`, and the editor mode, the page overlays and the comment list return with it.

## Open limits

- **Comments cannot be added.** The renderer's save drops text annotations. On each pdf.js bump, rerun the probe that stores a text annotation entry and reloads the file; if it survives the save, add a comment method and a requirement for it.
- **An imported free text takes the renderer's defaults.** XFDF does not carry its colour or size.
- **A drawn free text's export has not been seen in a browser.** It was checked against pdf.js's source and a stub, not a run. Resume: a harness page that mounts the annotation composable and the viewer in a browser test, draws one free text, exports it, and reads the saved file's free text back with pdf.js.

## Not the same thing

- [Form values](../../../specs/vue-pdfjs-headless/annotations/design.md) are built and kept in the package: a typed form value that a download carries, and not an editor. The stamp on a download is its own [watermark](../watermark/design.md) idea.
- [Viewer chrome](../viewer-chrome/design.md) holds the outline, thumbnails, fullscreen, rotation and zoom readout that the viewer no longer returns.

## Sources

- [ISO 19444-1, XML Forms Data Format](https://www.iso.org/standard/74272.html): the XML format for a PDF's annotations and form data, which XFDF follows.
- [pdf.js viewer](https://github.com/mozilla/pdf.js/blob/master/web/pdf_viewer.js): the viewer's annotation editor modes.
