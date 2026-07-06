import type { TableEntityQueryOptions } from "@azure/data-tables";
import type { CompositeKey, CustomTableClient } from "@esposter/db-schema";
import type { Class } from "type-fest";

import { getTopNEntitiesByClass } from "@/services/azure/table/getTopNEntitiesByClass";

export const getTopNEntities = <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  topN: number,
  cls: Class<TEntity>,
  queryOptions?: TableEntityQueryOptions,
): Promise<TEntity[]> => getTopNEntitiesByClass(tableClient, topN, () => cls, queryOptions);
