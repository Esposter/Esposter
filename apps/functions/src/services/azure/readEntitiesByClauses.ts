import type { Clause, CompositeKey } from "@esposter/azure";
import type { CustomTableClient } from "@esposter/db-schema";

import { AZURE_MAX_PAGE_SIZE, serializeClauses } from "@esposter/azure";

// Every row of one table that matches the clauses, walked page by page so no row is left behind past the first page. The
// Caller names the row's shape, since a table holds several entity types under one client
export const readEntitiesByClauses = async <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<CompositeKey>,
  clauses: Clause<Record<string, unknown>>[],
): Promise<TEntity[]> => {
  const entities: TEntity[] = [];
  for await (const page of tableClient
    .listEntities<TEntity>({ queryOptions: { filter: serializeClauses(clauses) } })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    entities.push(...page);
  return entities;
};
