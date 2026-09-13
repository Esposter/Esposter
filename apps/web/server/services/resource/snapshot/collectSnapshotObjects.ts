import type { Transaction } from "@@/server/models/db/Transaction";
import type { Context } from "@@/server/trpc/context";
import type { Resource, ResourceVersion } from "@esposter/db-schema";

import { createSnapshotKeyframeStore } from "@@/server/services/resource/snapshot/createSnapshotKeyframeStore";
import { lockSnapshotObjects } from "@@/server/services/resource/snapshot/lockSnapshotObjects";
import { resourceVersions } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { eq } from "drizzle-orm";

const getNamedHashes = (versions: Pick<ResourceVersion, "baseHash" | "hash">[]) =>
  versions.flatMap(({ baseHash, hash }) => (baseHash ? [hash, baseHash] : [hash]));
// An object survives while any row of the resource names it, as its own hash or as its base — so a keyframe
// Outlives its own row for as long as a delta still decodes against it, and a ring buffer sheds its oldest
// Segment whole. The released rows are the ones an eviction or an unpublish just deleted; what they named is
// Subtracted against every surviving row, and the remainder goes to the deletion path that releases its bytes.
// A query rather than an object read, which is what the base hash is denormalised onto the row for — and one
// Taken under the resource's object lock, so a write whose row is not yet inserted is either not started or
// Finished by the time the surviving rows are read (`lockSnapshotObjects`)
export const collectSnapshotObjects = async (
  db: Context["db"] | Transaction,
  resourceId: Resource["id"],
  releasedVersions: Pick<ResourceVersion, "baseHash" | "hash">[],
): Promise<void> => {
  const keyframeStore = await createSnapshotKeyframeStore(resourceId);
  await db.transaction(async (tx) => {
    await lockSnapshotObjects(tx, resourceId);
    const retainedVersions = await tx
      .select({ baseHash: resourceVersions.baseHash, hash: resourceVersions.hash })
      .from(resourceVersions)
      .where(eq(resourceVersions.resourceId, resourceId));
    await keyframeStore
      .collect(getNamedHashes(releasedVersions), getNamedHashes(retainedVersions))
      .match(noop, (error) => {
        throw error;
      });
  });
};
