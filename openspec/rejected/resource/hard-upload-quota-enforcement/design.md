# Hard upload quota enforcement

Enforcing a storage quota by checking the counter before the presigned PUT is issued, or by proxying uploads through the server so it counts bytes as they stream and aborts mid-stream.

## Why not

The obvious design — "read `storageBytesUsed`, if under quota issue the presigned PUT" — does not stop abuse, for two structural reasons:

1. **It races.** Read-then-check is not atomic. A client firing many upload requests concurrently has them all read the same low counter, all pass, and all upload — overshooting by an unbounded amount.
2. **The presigned PUT carries no byte cap.** Uploads are a two-step flow ([file uploads](../../../specs/architecture/file-uploads/design.md)): the server mints a scoped presigned PUT, the client PUTs bytes **directly to R2**. The server is never in the data path, so it cannot stop a client that declares 1 MB and PUTs 1 GB, and it cannot abort a transfer mid-stream.

This is the difference from Gmail and Drive: their uploads flow **through Google's servers**, so the server counts bytes as they stream and hard-aborts the instant you cross the line. We structurally cannot abort a direct-to-R2 upload — so the check is made **part of the write**, and what the client declared is never what it is ultimately charged.

True Gmail-style hard enforcement would require **proxying uploads through our own server** so it can count bytes and abort mid-stream. That is rejected: it puts our compute in the data path for every upload — cost, latency, and re-architecting the entire presigned-URL flow — to close a self-inflicted gap that only harms its own author.
