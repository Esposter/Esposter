# Highlight Terms on Load

A list of terms the viewer highlights in a loaded document, every match of each one, as soon as the document is applied to the viewer. The headless package carried it as the "highlightTerms" option of `usePdfViewer`.

None of it is in the package now. The option is gone, and so is the find the viewer dispatched on load with the terms as its query. The reader's own search, which highlights every match of the query typed, remains the viewer's.

## Why deferred

- No caller. The app's PDF viewer opens a document with no terms, and its search starts when the reader types a query.
- The reader's own query already does the highlighting a list of terms would do, so the option answered a question no surface asked.

## What it held

- The "highlightTerms" option of `usePdfViewer`, a list of terms, passed to the renderer's find controller once a document was applied, with the same case and whole-word options as the reader's search.
- The find carried the list as its query, so the renderer matched and highlighted every match of each term.
- A test pinned the find's dispatch on load, with the list as its query and highlight-all set.

## Revisit when

An app opens a document with terms already known to highlight, such as the terms of the search that led the reader to it. Reviving it moves this folder into `openspec/changes/`, and the option returns with it.

## Not the same thing

- The [viewer](../../../specs/vue-pdfjs-headless/viewer/design.md) highlights every match of the query the reader types, which is built.
