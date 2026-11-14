import type { StreamListOptions } from "#src/models/streams/StreamListOptions";
import type { StreamTableClient } from "#src/models/streams/StreamTableClient";
import type { Clause, CompositeKey } from "@esposter/db-schema";
import type { Class } from "type-fest";

import { deserializeEntity } from "#src/services/streams/deserializeEntity";

// The first topN rows of the clauses, newest-first, each read into the class its getClass names
export const getTopNEntitiesByClass = async <TEntity extends CompositeKey>(
  tableClient: StreamTableClient<TEntity>,
  topN: number,
  getClass: (entity: Record<string, unknown>) => Class<TEntity>,
  clauses: Clause<Record<string, unknown>>[] = [],
  options: Pick<StreamListOptions, "orderBy"> = {},
): Promise<TEntity[]> => {
  const rows = await tableClient.list(clauses, { ...options, limit: topN });
  return rows.map(({ etag: _etag, ...entity }) => deserializeEntity(entity, getClass(entity)));
};
