# Keyframe store

`packages/keyframe-store` (npm `keyframe-store`) is content-addressed version storage for documents handed over whole. Each version is stored as a zstd keyframe, compressed on its own, or as a delta compressed against exactly one keyframe, with that keyframe's plaintext as the dictionary. The package takes bytes and returns bytes over any backend that can store bytes by key, and it never looks inside the content it stores. Its [install page](../../../packages/keyframe-store/README.md) is the npm README; the pages here are the object format on disk and the contract a caller writes and reads through.

## Key concepts

- **Keyframe** — an object compressed on its own. It is the dictionary every delta anchored to it decodes against.
- **Delta** — an object compressed against one keyframe. Its header names that keyframe by its hash, so reading a delta needs nothing but the object and that one keyframe.
- **Anchor** — what a lineage passes to each write: the hash of its newest keyframe and the bytes anchored to it. The store holds no lineage, so the caller derives the anchor from its own records.
- **Base** — the keyframe an object is stored against. A keyframe has an empty base. Every write reports the base of the object it stored, and that base is what the caller's record has to carry.
- **Segment** — a keyframe with the deltas anchored to it. Those deltas may accumulate to a fixed multiple of the keyframe's own stored size, the segment budget. A write that would exceed the budget is promoted to a keyframe, which starts a new segment.

## Pages

- [Object format](object-format/design.md) — what an object is on disk: its address, its keyframe and delta forms, the promotion gate that chooses between them, the header that refuses a stranger's bytes, and the hash check every read makes.
- [Version store](version-store/design.md) — the caller's contract: the anchor it passes, the base each write reports, reconstruction in at most two reads, collection by the caller's own records, and the backend it is given.

The choice of zstd is the [compression](../architecture/compression/design.md) standard's, and the [resource version store](../resource/resource-version-store/design.md) page describes how the app keeps versions with the package.
