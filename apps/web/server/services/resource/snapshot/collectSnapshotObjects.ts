import type { Transaction } from "@@/server/models/db/Transaction";
import type { Context } from "@@/server/trpc/context";
import type { Resource, ResourceVersion } from "@esposter/db-schema";

import { createSnapshotObjectStore } from "@@/server/services/resource/snapshot/createSnapshotObjectStore";
import { resourceVersions } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { createKeyframeStore } from "keyframe-store";

const getNamedHashes = (versions: Pick<ResourceVersion, "baseHash" | "hash">[]) =>
  versions.flatMap(({ baseHash, hash }) => (baseHash ? [hash, baseHash] : [hash]));
// An object survives while any row of the resource names it, as its own hash or as its base — so a keyframe
// Outlives its own row for as long as a delta still decodes against it, and a ring buffer sheds its oldest
// Segment whole. The released rows are the ones an eviction or an unpublish just deleted; what they named is
// Subtracted against every surviving row, and the remainder goes to the deletion path that releases its bytes.
// A query rather than an object read, which is what the base hash is denormalised onto the row for
export const collectSnapshotObjects = async (
  db: Context["db"] | Transaction,
  resourceId: Resource["id"],
  releasedVersions: Pick<ResourceVersion, "baseHash" | "hash">[],
): Promise<void> => {
  const retainedVersions = await db
    .select({ baseHash: resourceVersions.baseHash, hash: resourceVersions.hash })
    .from(resourceVersions)
    .where(eq(resourceVersions.resourceId, resourceId));
  const keyframeStore = createKeyframeStore(await createSnapshotObjectStore(resourceId));
  await keyframeStore
    .collect(getNamedHashes(releasedVersions), getNamedHashes(retainedVersions))
    .match(noop, (error) => {
      throw error;
    });
};
