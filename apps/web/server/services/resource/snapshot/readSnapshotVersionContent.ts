import type { Context } from "@@/server/trpc/context";
import type { Resource, ResourceVersion } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { createSnapshotObjectStore } from "@@/server/services/resource/snapshot/createSnapshotObjectStore";
import { createKeyframeStore } from "keyframe-store";

// Reconstructs one retained version and parses it with the type's content schema. The row is what says a
// Version exists, so a version whose row is gone — evicted, or swept by an unpublish between the listing and
// The click — reads as "no content" rather than as an internal error, and reaches the visitor as the 404 page
export const readSnapshotVersionContent = async (
  db: Context["db"],
  resource: Pick<Resource, "id" | "type">,
  { channel, version }: Pick<ResourceVersion, "channel" | "version">,
): Promise<unknown> => {
  const resourceVersion = await db.query.resourceVersions.findFirst({
    columns: { hash: true },
    where: { channel: { eq: channel }, resourceId: { eq: resource.id }, version: { eq: version } },
  });
  if (!resourceVersion) return undefined;

  const keyframeStore = createKeyframeStore(await createSnapshotObjectStore(resource.id));
  const plaintext = await keyframeStore.read(resourceVersion.hash).match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
  // oxlint-disable-next-line no-restricted-properties -- the content schema owns date coercion, exactly as readContentBlob relies on
  return ResourceDefinitionMap[resource.type].contentSchema.parse(JSON.parse(Buffer.from(plaintext).toString()));
};
