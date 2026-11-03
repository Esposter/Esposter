# Watermark

A text the download carries on every page. The headless package's download stored it into the renderer's annotation storage for one save, as a free text on each page centred on the page's height, then removed the entries after the save, so the pages on screen never held the stamp.

None of it is in the package now. The "watermark" option of `usePdfViewer` is gone, and so are the stamp's storage entries, its constants and the branch of `getDownloadBytes` that wrote them. The download saves the original bytes, or the renderer's saved bytes once a form value is stored, as the [annotations](../../../specs/vue-pdfjs-headless/annotations/design.md) page describes.

## Why deferred

- No caller. The app's PDF viewer passes no watermark to the package, so the option had nothing to serve.
- The stamp is a property of the file a reader downloads, and no product surface asked for it.
- It writes free texts into the renderer's storage, and a save with several of them logs a pdf.js error (see Open limits), so it is not a cheap addition.

## What it held

- The "watermark" option, a text the viewer passed to `getDownloadBytes` with each download. The stamp was stored for that save alone: one free-text entry per page, under the renderer's editor key prefix, with the id watermark and the page index, drawn in grey at 48 points tall across the page's width.
- Decision: the watermark is written at save, not drawn on screen. Drawing it into the page canvas was rejected: the mark would never reach the downloaded file, which is where a watermark is for. It was stored on every page before the save and removed after it, so the pages on screen never held it.
- The test read the stored entries at the moment the renderer saved, so the stamp's placement and its removal afterwards were both proved.

## Revisit when

An app passes a watermark text to the viewer, and its downloads must carry the stamp. Reviving it moves this folder into `openspec/changes/`, and the option, the storage entries and their constants return with it.

## Open limits

- **Several free texts in one save log a pdf.js error.** The stamp stored one free text per page, and pdf.js logs `Object already resolved` as an unhandled rejection for a save holding several. The saved bytes reload with every one. Resume: file the pdf.js reproduction upstream by hand (two free texts in one `saveDocument` call on pdf.js 6.4.299, run with the legacy build in Node), then link the issue from the [annotations](../../../specs/vue-pdfjs-headless/annotations/design.md) page.
- **The stamp's grey has not been seen in a browser.** It was checked against pdf.js's source and a stub, not a run. Resume: a harness page that mounts the viewer with a watermark, saves the download, and reads the stamped free text's colour back with pdf.js.

## Not the same thing

- The [form values](../../../specs/vue-pdfjs-headless/annotations/design.md) the download carries are built: the typed values in the saved bytes, with no stamp.
- The [annotation UI](../annotation-ui/design.md) holds drawn annotations and comments, which also store free texts but are not a stamp on the whole document.
