import type { Resource } from "@esposter/db-schema";

import { PUBLISHED_DIRECTORY_SEGMENT } from "#shared/services/resource/constants";

// A fresh directory per publish attempt, deliberately not keyed by publishVersion: the version is claimed by the
// Publish transaction, so a clone that runs before it can only predict one — and two concurrent publishes predict
// The same, name one destination twice and race a copy Azure rejects, unwinding a publish that did nothing wrong.
// Nothing reads a version back out of an asset path (teardown wipes the whole published prefix), so the
// Snapshot's own content is what points at these blobs
export const createPublishedAssetsDirectoryName = (resourceId: Resource["id"]) =>
  `${resourceId}/${PUBLISHED_DIRECTORY_SEGMENT}/${crypto.randomUUID()}`;
