import type { TableEntityQueryOptions } from "@azure/data-tables";
import type { CompositeKey } from "@esposter/azure";
import type { CustomTableClient } from "@esposter/db-schema";
import type { Class } from "type-fest";

import { deserializeEntity } from "#src/services/azure/transformer/deserializeEntity";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/azure";

export const getTopNEntitiesByClass = async <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  topN: number,
  getClass: (entity: Record<string, unknown>) => Class<TEntity>,
  queryOptions?: TableEntityQueryOptions,
): Promise<TEntity[]> => {
  // Filter out metadata like continuation token before deserializing the json
  // Azure may return a short page even when more rows exist, so keep paging until topN entities
  // Are collected or the partition is exhausted — a full first page still costs a single request,
  // And a short result now proves there is genuinely nothing more to read.
  // Azure rejects $top above its page-size cap, so a larger topN pages at the cap instead
  const topEntities: TEntity[] = [];
  for await (const page of tableClient
    .listEntities({ queryOptions })
    .byPage({ maxPageSize: Math.min(topN, AZURE_MAX_PAGE_SIZE) }))
    for (const { etag: _etag, ...entity } of page) {
      topEntities.push(deserializeEntity(entity, getClass(entity)));
      if (topEntities.length === topN) return topEntities;
    }
  return topEntities;
};
