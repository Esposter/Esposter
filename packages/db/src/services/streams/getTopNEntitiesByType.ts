import type { StreamListOptions } from "#src/models/streams/StreamListOptions";
import type { StreamTableClient } from "#src/models/streams/StreamTableClient";
import type { AzureEntity, Clause } from "@esposter/db-schema";
import type { ItemEntityType } from "@esposter/shared";
import type { Class } from "type-fest";

import { getTopNEntitiesByClass } from "#src/services/streams/getTopNEntitiesByClass";

export const getTopNEntitiesByType = <TType extends string, TEntity extends AzureEntity & ItemEntityType<TType>>(
  tableClient: StreamTableClient<TEntity>,
  topN: number,
  clsMap: Record<TType, Class<TEntity>>,
  clauses: Clause<Record<string, unknown>>[] = [],
  options: Pick<StreamListOptions, "orderBy"> = {},
): Promise<TEntity[]> =>
  getTopNEntitiesByClass(tableClient, topN, (entity) => clsMap[entity.type as TType], clauses, options);
