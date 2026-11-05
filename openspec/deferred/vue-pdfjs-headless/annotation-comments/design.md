# Annotation comments

Adding a comment to a document through `usePdfAnnotations`: a text annotation the reader writes on a page, listed with the document's comments and saved into the download. The [annotations design](../../../specs/vue-pdfjs-headless/annotations/design.md) lists comments and does not add them, and its spec says so.

## Why deferred

- **The pinned pdf.js drops a standalone comment.** Its save has a branch for each stored editor of the types FreeText, Highlight, Ink, Stamp and Signature, and none for a text annotation, the sticky note. The stored entry is accepted, the save resolves, and the reloaded page lists no annotation for it, so a sticky note added today would leave the download without an error. The canary test `pdf.js still drops a Text annotation when it saves` in `packages/vue-pdfjs-headless/src/services/getDownloadBytes.test.ts` holds this as measured.
- **A comment on an editor is saved.** A stored FreeText, Highlight, Ink or Stamp entry that carries a `popup` field with the contents is saved with a linked popup annotation, and the reloaded page lists both. The viewer's own comment dialog writes that field and no public call does, so this route needs the package to write the field itself.
- **A second PDF library was rejected.** Writing the comment with one would work, but the renderer's storage is the model the package saves through, and a comment written beside it would not reach the download the renderer saves. The annotations design rejects the same route for XFDF.
- **No caller adds one.** The app's Comments tab lists a document's comments. The upstream request for adding them is open on the wrapper's tracker, and the [package's Upstream table](../../../specs/vue-pdfjs-headless/README.md) answers it with this idea.

## Revisit when

The pinned pdf.js saves a text annotation, which shows as the canary test failing after a bump of the pinned version, or the revival takes the popup route above, which the pinned pdf.js already saves. The canary is an ordinary test, so CI's test run on the bump is the check that finds it. Then this folder moves into `openspec/changes/`, the design below is built, and the canary is retired in the same change, since its assertion is the one the change reverses.

## What adding a comment would be

This is the design the revived change starts from. The save's behaviour is the pinned pdf.js's as measured; the drawing is not measured yet and the revival measures it before it decides the drawing.

- **The route.** A comment is either a sticky note, a text annotation of its own that the pinned pdf.js drops, or the `popup` of a stored editor entry, which it saves but which belongs to that markup annotation and is listed and deleted with it. The revival picks one by what a reader expects of a comment on an empty part of a page, and measures the save of the route it picks before it builds on it.
- **The call.** `usePdfAnnotations` returns `addComment({ contents, pageNumber, rect })` as a `Result`, the shape `importXfdf` returns, so the call refuses a page that does not exist and blank contents, and stores nothing on a refusal.
- **The entry.** A `createCommentEntry` service beside `createFreeTextEntry` builds the storage entry. It carries the renderer's text-annotation type rather than an editor mode, and it is written under its own key namespace, apart from drawn editors and imports, since pdf.js numbers its editors from zero.
- **The list.** `comments` lists the stored comments beside the page annotations, so an added comment is listed before the save. The revival checks that a saved comment reloads at its page and rectangle, so the list and the download agree.
- **The change.** The renderer's editor hook fires for editors only, and a stored text annotation is not one, so `addComment` reports the change itself. A consumer that saves on a change then saves the comment.
- **The drawing.** Whether the renderer draws a stored text annotation on its page before a save is not measured. The revival measures it first, since it decides whether the reader sees the comment before the reload.
- **The file.** XFDF carries free texts only, as the annotations design states. Exporting comments would add text annotations to `readXfdf` and `writeXfdf`, which the revival decides.
- **The icon.** A text annotation's icon is requested from the consumer's icon folder, as the annotations design already states for every comment.
- **The spec.** The annotations spec gains a requirement that a comment is added and saved, and its sentence that the package does not add comments goes. The annotations design's decision that comments are listed, not added, is replaced.

## Cheaper interim

The read-only list the annotations spec states is the interim: comments are shown, and none is added from the package.

## Key files

| File                                                                | Role                                                                                   |
| :------------------------------------------------------------------ | :------------------------------------------------------------------------------------- |
| `packages/vue-pdfjs-headless/src/composables/usePdfAnnotations.ts`  | the comment list and the XFDF import whose result shape `addComment` would follow      |
| `packages/vue-pdfjs-headless/src/services/createFreeTextEntry.ts`   | the storage entry a comment's builder would follow beside it                           |
| `packages/vue-pdfjs-headless/src/models/PdfComment.ts`              | the comment type the list holds                                                        |
| `packages/vue-pdfjs-headless/src/services/getDownloadBytes.test.ts` | the canary whose failure after a bump revives this idea, and which the revival retires |

## Sources

- [pdf.js](https://github.com/mozilla/pdf.js), the save behaviour in the pinned build, probed in Node with its legacy build as the [annotations design](../../../specs/vue-pdfjs-headless/annotations/design.md) describes.
- The [package's Upstream table](../../../specs/vue-pdfjs-headless/README.md), which links this idea from the wrapper's request for comments.
