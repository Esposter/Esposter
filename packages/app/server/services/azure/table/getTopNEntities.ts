import type { CustomTableClient } from "@/server/models/azure/table/CustomTableClient";
import type { CompositeKey } from "@/shared/models/azure/CompositeKey";
import type { TableEntityQueryOptions } from "@azure/data-tables";
import type { Constructor } from "type-fest";

import { plainToInstance } from "class-transformer";

export const getTopNEntities = async <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  topN: number,
  cls: Constructor<TEntity>,
  queryOptions?: TableEntityQueryOptions,
): Promise<TEntity[]> => {
  const listResults = tableClient.listEntities<TEntity>({ queryOptions });
  const iterator = listResults.byPage({ maxPageSize: topN });

  for await (const page of iterator) {
    // Filter out metadata like continuation token before deserializing the json
    // Take the first page as the topEntries result
    // This only sends a single request to the service
    return plainToInstance(cls, page.slice(0, topN));
  }

  return [];
};
