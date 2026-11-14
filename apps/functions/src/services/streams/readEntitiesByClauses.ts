import type { StreamTableClient } from "@esposter/db";
import type { Clause, CompositeKey } from "@esposter/db-schema";

// Every row of one table that matches the clauses. The caller names the row's shape, since a table holds several
// entity types under one client
export const readEntitiesByClauses = async <TEntity extends CompositeKey>(
  tableClient: StreamTableClient<CompositeKey>,
  clauses: Clause<Record<string, unknown>>[],
): Promise<TEntity[]> => {
  const rows = await tableClient.list(clauses);
  return rows.map(({ etag: _etag, ...entity }) => entity as TEntity);
};
