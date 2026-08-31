import type { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import type { Resource } from "@esposter/db-schema";

// A fresh directory per snapshot attempt, deliberately not keyed by the version: the version is claimed by the
// Publish transaction, so a clone that runs before it can only predict one — and two concurrent publishes predict
// The same, name one destination twice and race a copy Azure rejects, unwinding a publish that did nothing wrong.
// Nothing reads a version back out of an asset path (teardown wipes the whole channel prefix), so the
// Snapshot's own content is what points at these blobs.
// Immutable channels only — a reference snapshot clones nothing, so it never needs a directory of its own
export const createSnapshotAssetsDirectoryName = (resourceId: Resource["id"], channel: SnapshotChannel) =>
  `${resourceId}/${channel}/${crypto.randomUUID()}`;
