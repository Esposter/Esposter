# Undo as patches

## Undo and redo as patches

An edit is a list of operations in JSON Patch's add, remove and replace, each addressed by a JSON Pointer from the document root. `applyPatches`, the one JSON Patch applier, which the [agent content tools](../../specs/architecture/agent-content-tools/design.md) also apply on the server and the [headless core](../resource-page-builder-headless-core/design.md) moves into `@esposter/shared`, copies the path to each changed node, so the new document shares every untouched subtree with the old one and a canvas node whose object did not change does not re-render; as it applies each operation it records the inverse, so undo is the inverse list applied in reverse and redo is the forward list again. A move is a remove and an add. Consecutive replaces of one path within one interaction coalesce into one entry, keeping the first inverse and the last value.

The recording, the coalescing and the bounded stack are the headless core's; this change keeps them per open resource and names them for the command bar. History is a bounded list per open resource, in the shape of `apps/web/app/store/resource/sheet/history/index.ts` — history and future, the undo and redo labels the command bar shows — and the second consumer is the moment the two collapse onto one primitive. A restore clears it, since its entries describe a document that is gone; that is the only restore hook the new editors need, because the canvas renders the content ref and a restore replaces the ref ([third-party document adapters](../../specs/architecture/third-party-document-adapters/design.md)).

The editor's patches never leave the browser. A save is still the whole document through the one door, which [delta content saves](../../specs/resource/delta-content-saves/design.md) already make cheap; [JSON Patch content saves](../../rejected/resource/json-patch-content-saves/design.md) stay rejected.

## Sources

- [RFC 6902 — JSON Patch](https://www.rfc-editor.org/rfc/rfc6902.html) and [RFC 6901 — JSON Pointer](https://www.rfc-editor.org/rfc/rfc6901.html) — the operations and paths an edit is written in.
