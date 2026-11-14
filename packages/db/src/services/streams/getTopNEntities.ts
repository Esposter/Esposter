import type { StreamListOptions } from "#src/models/streams/StreamListOptions";
import type { StreamTableClient } from "#src/models/streams/StreamTableClient";
import type { Clause, CompositeKey } from "@esposter/db-schema";
import type { Class } from "type-fest";

import { getTopNEntitiesByClass } from "#src/services/streams/getTopNEntitiesByClass";

export const getTopNEntities = <TEntity extends CompositeKey>(
  tableClient: StreamTableClient<TEntity>,
  topN: number,
  cls: Class<TEntity>,
  clauses: Clause<Record<string, unknown>>[] = [],
  options: Pick<StreamListOptions, "orderBy"> = {},
): Promise<TEntity[]> => getTopNEntitiesByClass(tableClient, topN, () => cls, clauses, options);
