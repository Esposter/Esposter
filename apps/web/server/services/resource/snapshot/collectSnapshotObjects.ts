import type { Context } from "#server/trpc/context";
import type { ResourceInResource, ResourceVersionInResource } from "@esposter/db-schema";

import { createSnapshotKeyframeStore } from "#server/services/resource/snapshot/createSnapshotKeyframeStore";
import { withResourceObjectLock } from "#server/services/resource/snapshot/withResourceObjectLock";
import { resourceVersionsInResource } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { eq } from "drizzle-orm";

const getNamedHashes = (versions: Pick<ResourceVersionInResource, "baseHash" | "hash">[]) =>
  versions.flatMap(({ baseHash, hash }) => (baseHash ? [hash, baseHash] : [hash]));
// An object survives while any row of the resource names it, as its own hash or as its base — so a keyframe
// Outlives its own row for as long as a delta still decodes against it, and a ring buffer sheds its oldest
// Segment whole. The released rows are the ones an eviction or an unpublish just deleted; what they named is
// Subtracted against every surviving row, and the remainder goes to the deletion path that releases its bytes.
// A query rather than an object read, which is what the base hash is denormalised onto the row for. The rows are read and
// The objects deleted under the lease, so a write that stores an object and then names it cannot fall between the two
export const collectSnapshotObjects = (
  db: Context["db"],
  resourceId: ResourceInResource["id"],
  releasedVersions: Pick<ResourceVersionInResource, "baseHash" | "hash">[],
): Promise<void> =>
  withResourceObjectLock(db, resourceId, async () => {
    const keyframeStore = await createSnapshotKeyframeStore(resourceId);
    const retainedVersions = await db
      .select({ baseHash: resourceVersionsInResource.baseHash, hash: resourceVersionsInResource.hash })
      .from(resourceVersionsInResource)
      .where(eq(resourceVersionsInResource.resourceId, resourceId));
    await keyframeStore
      .collect(getNamedHashes(releasedVersions), getNamedHashes(retainedVersions))
      .match(noop, (error) => {
        throw error;
      });
  });
