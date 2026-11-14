import type { ResourceInResource } from "@esposter/db-schema";

import { useStreamTableClient } from "#server/composables/streams/useStreamTableClient";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/azure";
import { getPartitionClauses, getTopNEntities } from "@esposter/db";
import { StreamTable, ResourceViewEntity } from "@esposter/db-schema";

// Sums the day buckets over a capped scan — magnitudes matter more than precision here
export const readResourceViewCount = async (resourceId: ResourceInResource["id"]): Promise<number> => {
  const resourceViewClient = useStreamTableClient(StreamTable.ResourceViews);
  const resourceViews = await getTopNEntities(
    resourceViewClient,
    AZURE_MAX_PAGE_SIZE,
    ResourceViewEntity,
    getPartitionClauses(resourceId),
  );
  return resourceViews.reduce((total, { count }) => total + count, 0);
};
