# Content-Addressed Assets

## Why

Publishing a resource clones every asset its content references and rewrites each url to point at the clone, one storage round trip per asset, paid on the publish request. The clone walk is what lets an unpublish sweeping assets during a publish leave a live publication with missing images, and the recovery needs a re-clone and a re-upload after the transaction has committed. An asset addressed by the hash of its bytes cannot be replaced in place, so a published snapshot and the working copy can share one object, and nothing needs cloning or rewriting. The difficulty that remains is reference tracking, because an asset's references live inside content rather than in a column, and a scan that misses a reference deletes an asset still in use.

## What Changes

Assets are stored under the hash of their bytes, so a published version shares its assets with the working copy instead of cloning them.

- Publishing no longer clones assets or rewrites asset urls, so a publish makes no per-asset round trip.
- An identical file uploaded again by the same owner is referenced rather than stored again, and is not charged again.
- Each stored version records the assets its content references, and collecting a version releases the assets nothing else references.
- Assets are counted but never deleted during a counting-only period, so an undercounting scan shows up as an asset nothing deletes rather than one deleted too early.
- **Capabilities:** `resource/content-addressed-assets` (new).

## Capabilities

- **resource/content-addressed-assets** (new)

## Waiting on

- The resource version store, which this phase follows and which must be proven in production before it starts. It is a specification, not a change.

## Impact

- Asset upload, which addresses each file by its bytes and signs its upload for that address.
- Publishing and unpublishing, which stop cloning and rewriting assets.
- Version storage, which scans each version it writes for asset addresses and records them in a reference table.
- The deletion sweep, which drops a collected version's references and deletes only unreferenced assets.
- The database schema gains the version-to-asset reference table.
