import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";
import type { TableEntityQueryOptions } from "@azure/data-tables";
import type { CompositeKey } from "@esposter/shared";
import type { Class } from "type-fest";

import { deserializeEntity } from "@@/server/services/azure/transformer/deserializeEntity";

export const getTopNEntities = async <TEntity extends CompositeKey>(
  tableClient: NoInfer<CustomTableClient<TEntity>>,
  topN: number,
  cls: Class<TEntity>,
  queryOptions?: TableEntityQueryOptions,
): Promise<TEntity[]> => {
  // Filter out metadata like continuation token before deserializing the json
  // Take the first page as the topEntries result
  // This only sends a single request to the service
  for await (const page of tableClient.listEntities<TEntity>({ queryOptions }).byPage({ maxPageSize: topN }))
    return page.slice(0, topN).map(({ etag: _etag, ...entity }) => deserializeEntity(entity as TEntity, cls));
  return [];
};
