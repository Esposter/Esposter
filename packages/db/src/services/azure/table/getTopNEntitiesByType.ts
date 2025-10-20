import type { TableEntityQueryOptions } from "@azure/data-tables";
import type { AzureEntity, CustomTableClient } from "@esposter/db-schema";
import type { ItemEntityType } from "@esposter/shared";
import type { Class } from "type-fest";

import { deserializeEntity } from "@/services/azure/transformer/deserializeEntity";

export const getTopNEntitiesByType = async <TType extends string, TEntity extends AzureEntity & ItemEntityType<TType>>(
  tableClient: CustomTableClient<TEntity>,
  topN: number,
  clsMap: Record<TType, Class<TEntity>>,
  queryOptions?: TableEntityQueryOptions,
): Promise<TEntity[]> => {
  // Filter out metadata like continuation token before deserializing the json
  // Take the first page as the topEntries result
  // This only sends a single request to the service
  for await (const page of tableClient
    .listEntities<Record<keyof TEntity, unknown>>({ queryOptions })
    .byPage({ maxPageSize: topN }))
    return page
      .slice(0, topN)
      .map(({ etag: _etag, ...entity }) => deserializeEntity(entity, clsMap[entity.type as TType]));
  return [];
};
