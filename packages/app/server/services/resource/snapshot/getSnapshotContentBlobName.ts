import type { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import type { Resource } from "@esposter/db-schema";

// A snapshot's address. `{id}/{channel}/{version}` is the blob's stem, not a directory — an immutable
// Channel's asset clones live under `{id}/{channel}/{snapshotId}/`, keyed by the attempt's uuid
export const getSnapshotContentBlobName = (resourceId: Resource["id"], channel: SnapshotChannel, version: number) =>
  `${resourceId}/${channel}/${version}.json`;
