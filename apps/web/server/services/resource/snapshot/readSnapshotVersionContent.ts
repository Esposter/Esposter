import type { Context } from "#server/trpc/context";
import type { ResourceInResource, ResourceVersionInResource } from "@esposter/db-schema";

import { createSnapshotKeyframeStore } from "#server/services/resource/snapshot/createSnapshotKeyframeStore";
import { getSnapshotRetainedSince } from "#shared/services/resource/getSnapshotRetainedSince";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ObjectNotStoredError } from "keyframe-store";

// Reconstructs one retained version and parses it with the type's content schema. The row is what says a version
// Exists, so a version whose row is gone or past its channel's age — evicted, expired, or swept by an unpublish between
// The listing and the click — reads as "no content" rather than as an internal error, and reaches the visitor as the
// 404 page. The objects the row names can go the same way: collection frees them as soon as no record names them, and a
// Row still standing over swept bytes is the same absent version wearing a different mask, so it answers the same way.
// Every other read failure is corruption — a truncated object, one that no longer hashes to its key — and that stays an
// Internal error rather than being dressed up as a page that was never there.
export const readSnapshotVersionContent = async (
  db: Context["db"],
  resource: Pick<ResourceInResource, "id" | "type">,
  { channel, version }: Pick<ResourceVersionInResource, "channel" | "version">,
): Promise<unknown> => {
  const resourceVersion = await db.query.resourceVersionsInResource.findFirst({
    columns: { hash: true },
    where: {
      channel: { eq: channel },
      createdAt: { gt: getSnapshotRetainedSince(channel) },
      resourceId: { eq: resource.id },
      version: { eq: version },
    },
  });
  if (!resourceVersion) return undefined;

  const keyframeStore = await createSnapshotKeyframeStore(resource.id);
  const plaintext = await keyframeStore.read(resourceVersion.hash).match<Uint8Array | undefined>(
    (value) => value,
    (error) => {
      if (error instanceof ObjectNotStoredError) return undefined;
      throw error;
    },
  );
  if (plaintext)
    // oxlint-disable-next-line no-restricted-properties -- the content schema owns date coercion, exactly as readResourceContent relies on
    return ResourceDefinitionMap[resource.type].contentSchema.parse(JSON.parse(Buffer.from(plaintext).toString()));
  else return undefined;
};
