# Asset touches per save and per version

## Why

[Content-addressed assets](../../specs/resource/content-addressed-assets/design.md) counts a file as referenced when its 64-character hash occurs as a whole token anywhere in a document, so a whiteboard's bare-id image is kept with no schema read. The scan is deliberately loose, and its looseness stays: a bare id must be touched to survive collection.

The cost of that looseness was not written down. `getSnapshotAssetHashes` now returns every whole token, and `touchSnapshotAssets` touches each one that is stored. A document holding N digests in text, such as pasted hashes in a text block, costs N blob touches on each version write (`writeSnapshotVersion` touches every hash, every version), and on the first save that names them (`reserveWorkingAssets`). The count follows the document's digests, not its real assets.

## What Changes

Decide how the touch cost is bounded without loosening collection's safety. The options the owner chooses between:

1. **Touch only what is not already reserved.** Working-copy rows already name the hashes a save reserved, so a version write could touch only the hashes it adds beyond them, keeping the grace window for every hash it names.
2. **Keep every touch, and bound the batch.** Leave the scan as it is and accept N touches, measured on a document with a realistic digest count.
3. **Narrow the scan to typed bare ids.** Count a bare id only where a known element stores it. This reverses the schema-free choice in the content-addressed design, so it needs that design's owner to agree.

The chosen option is written into `content-addressed-assets/design.md` in the change that ships it. The cost is measured on a document of many digests before the choice, and the result is recorded in `design.md`.

## Out of scope

- The reference scan's whole-token rule, which the content-addressed design owns.
