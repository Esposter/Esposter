import type { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import type { Resource } from "@esposter/db-schema";

// A fresh directory per snapshot attempt, deliberately not keyed by the version: the publish transaction claims
// The version, so a clone running before it can only predict one — and two concurrent publishes predict the same,
// Name one destination twice and race a copy Azure rejects. Nothing reads a version back out of an asset path,
// Since teardown wipes the whole channel prefix. Immutable channels only, as a reference snapshot clones nothing
export const createSnapshotAssetsDirectoryName = (resourceId: Resource["id"], channel: SnapshotChannel) =>
  `${resourceId}/${channel}/${crypto.randomUUID()}`;
