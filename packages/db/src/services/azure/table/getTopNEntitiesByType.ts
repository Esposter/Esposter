import type { TableEntityQueryOptions } from "@azure/data-tables";
import type { AzureEntity, CustomTableClient } from "@esposter/db-schema";
import type { ItemEntityType } from "@esposter/shared";
import type { Class } from "type-fest";

import { getTopNEntitiesByClass } from "#src/services/azure/table/getTopNEntitiesByClass";

export const getTopNEntitiesByType = <TType extends string, TEntity extends AzureEntity & ItemEntityType<TType>>(
  tableClient: CustomTableClient<TEntity>,
  topN: number,
  clsMap: Record<TType, Class<TEntity>>,
  queryOptions?: TableEntityQueryOptions,
): Promise<TEntity[]> =>
  getTopNEntitiesByClass(tableClient, topN, (entity) => clsMap[entity.type as TType], queryOptions);
