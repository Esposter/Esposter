import type { Resource } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { AZURE_MAX_PAGE_SIZE, getPartitionKeyFilter } from "@esposter/azure";
import { getTopNEntities } from "@esposter/db";
import { AzureTable, ResourceViewEntity } from "@esposter/db-schema";

// Sums the day buckets over a capped scan — magnitudes matter more than precision here
export const readResourceViewCount = async (resourceId: Resource["id"]): Promise<number> => {
  const resourceViewClient = await useTableClient(AzureTable.ResourceViews);
  const resourceViews = await getTopNEntities(resourceViewClient, AZURE_MAX_PAGE_SIZE, ResourceViewEntity, {
    filter: getPartitionKeyFilter(resourceId),
  });
  return resourceViews.reduce((total, { count }) => total + count, 0);
};
