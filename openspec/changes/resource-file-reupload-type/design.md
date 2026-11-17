## Context

`generateReservedResourceAssetPresignedUrlEntities` answers a held file with an empty presigned url, so the client sends no PUT. `checkIsResourceAssetHeld` then calls `touchResourceAssetBlob`, which rewrites the object under its own name with the object's existing `httpMetadata`. The content type of a held blob is therefore the one its first upload stored, and `readResourceFiles` reports that type.

## Decision

A re-uploaded file lists the type its latest upload declared. The touch that already rewrites a held blob writes the declared content type alongside the stored body, so the object and the listing agree after the upload. The touch takes the declared type as an optional argument: `checkIsResourceAssetHeld` passes the upload's declared type, while `touchSnapshotAssets` passes none and the blob keeps the type it is stored as. A snapshot touch therefore never changes a file's type. An empty declared type is no type, as it is for a presigned PUT: a browser reports `""` for a file it cannot name, so the touch writes a type only when the declared one is non-empty, and a blob with no declared type to write is never rewritten to an empty one.

The alternatives lost:

- **The first upload's type stands.** This is what ships today. It keeps the listing stable, but it hides a file from the picker the owner has just declared a different kind, and the only way out is to delete and re-add the file under a new hash. The comment and spec would have to say so.
- **The listing reads the type from a row beside each object.** It would answer any declared type without rewriting the object, but the file-assets design rejects a row per object ("no row is kept beside an object"), and the row would need the same reconciliation the rewrite gives for free.
- **Reject a re-upload whose declared type differs.** It refuses a valid action on bytes the owner already holds, and the client has no path to recover from it.

## Open Questions

None that change the specs or the tasks: the recommended option is recorded here, and a reviewer may take another in its place before implementation.
