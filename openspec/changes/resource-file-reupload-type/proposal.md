## Why

A file's listed type is read off the object it is stored as. A held upload is answered with no signature and no PUT, so the object keeps the type its first upload stored, and the listing reports that type even when a later upload declares another. An owner who first stored bytes as a generic binary and later uploads the same bytes as a video finds the file hidden from the video picker, which filters on the declared kind. The listing's comment and the file-assets design both say the type is the one the signed upload declared, which is false for a re-upload.

## What Changes

- A re-uploaded file lists the type its latest upload declared, so the picker follows what the owner last said the file is.
- The held path rewrites the blob's content type to that declared type when it touches the blob, the same rewrite that already restarts its grace window.
- The listing's comment and the file-assets design's listing row are corrected to match the behaviour that ships.

## Capabilities

### Modified Capabilities

- resource-file-assets (resource/resource-file-assets): a re-uploaded file takes the type its latest upload declared.

## Impact

`readResourceFiles` (its comment), `generateReservedResourceAssetPresignedUrlEntities` and `checkIsResourceAssetHeld` (the declared type reaches the held path), and `touchResourceAssetBlob` (writes the declared content type). No stored data changes shape; a file whose type is rewritten is the one a re-upload touched.
