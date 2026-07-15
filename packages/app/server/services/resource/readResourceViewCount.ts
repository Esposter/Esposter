import type { Clause, Resource } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getTopNEntities, serializeClauses } from "@esposter/db";
import {
  AZURE_MAX_PAGE_SIZE,
  AzureTable,
  BinaryOperator,
  CompositeKeyPropertyNames,
  ResourceViewEntity,
} from "@esposter/db-schema";

// Sums the day buckets over a capped scan — magnitudes matter more than precision here
export const readResourceViewCount = async (resourceId: Resource["id"]): Promise<number> => {
  const clauses: Clause<ResourceViewEntity>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: resourceId },
  ];
  const resourceViewClient = await useTableClient(AzureTable.ResourceViews);
  const resourceViews = await getTopNEntities(resourceViewClient, AZURE_MAX_PAGE_SIZE, ResourceViewEntity, {
    filter: serializeClauses(clauses),
  });
  return resourceViews.reduce((total, { count }) => total + count, 0);
};
