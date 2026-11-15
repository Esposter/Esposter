# Annotation comments

Adding a comment to a document through `usePdfAnnotations`: a text annotation the reader writes on a page, listed with the document's comments and saved into the download. The [annotations design](../../../specs/vue-pdfjs-headless/annotations/design.md) lists comments and does not add them, and its spec says so.

## Why deferred

- **The pinned pdf.js drops a standalone comment.** Its save has a branch for each stored editor of the types FreeText, Highlight, Ink, Stamp and Signature, and none for a text annotation, the sticky note. The stored entry is accepted, the save resolves, and the reloaded page lists no annotation for it, so a sticky note added today would leave the download without an error. The canary test `pdf.js still drops a Text annotation when it saves` in `packages/vue-pdfjs-headless/src/services/getDownloadBytes.test.ts` holds this as measured.
- **A comment on an editor is saved.** A stored FreeText, Highlight, Ink or Stamp entry that carries a `popup` field with the contents is saved with a linked popup annotation, and the reloaded page lists both. The viewer's own comment dialog writes that field and no public call does, so this route needs the package to write the field itself.
- **A second PDF library was rejected.** Writing the comment with one would work, but the renderer's storage is the model the package saves through, and a comment written beside it would not reach the download the renderer saves. The annotations design rejects the same route for XFDF.
- **No caller adds one.** The app's Comments tab lists a document's comments. The upstream request for adding them is open on the wrapper's tracker, and the [package's Upstream table](../../../specs/vue-pdfjs-headless/README.md) answers it with this idea.

## Revisit when

The pinned pdf.js saves a text annotation, which shows as the canary test failing after a bump of the pinned version, or the revival takes the popup route above, which the pinned pdf.js already saves. The canary is an ordinary test, so CI's test run on the bump is the check that finds it. Then this folder moves into `openspec/changes/`, and the change designs the comment, measures how the renderer draws a stored text annotation before a save, and retires the canary in the same change, since its assertion is the one the change reverses.

## Cheaper interim

The read-only list the annotations spec states is the interim: comments are shown, and none is added from the package.

## Key files

| File                                                                | Role                                                                                   |
| :------------------------------------------------------------------ | :------------------------------------------------------------------------------------- |
| `packages/vue-pdfjs-headless/src/composables/usePdfAnnotations.ts`  | the comment list and the XFDF import, whose result shape a comment call would follow   |
| `packages/vue-pdfjs-headless/src/services/createFreeTextEntry.ts`   | the storage entry the drawn annotations are built with                                 |
| `packages/vue-pdfjs-headless/src/models/PdfComment.ts`              | the comment type the list holds                                                        |
| `packages/vue-pdfjs-headless/src/services/getDownloadBytes.test.ts` | the canary whose failure after a bump revives this idea, and which the revival retires |

## Sources

- [pdf.js](https://github.com/mozilla/pdf.js), the save behaviour in the pinned build, probed in Node with its legacy build as the [annotations design](../../../specs/vue-pdfjs-headless/annotations/design.md) describes.
- The [package's Upstream table](../../../specs/vue-pdfjs-headless/README.md), which links this idea from the wrapper's request for comments.
