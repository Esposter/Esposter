import type { Clause, CompositeKey } from "@esposter/azure";
import type { CustomTableClient } from "@esposter/db-schema";

import { AZURE_MAX_PAGE_SIZE, serializeClauses } from "@esposter/azure";

// Every row of one table that matches the clauses, walked page by page so no row is left behind past the first page
export const readEntitiesByClauses = async <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  clauses: Clause<Record<string, unknown>>[],
): Promise<TEntity[]> => {
  const entities: TEntity[] = [];
  for await (const page of tableClient
    .listEntities<TEntity>({ queryOptions: { filter: serializeClauses(clauses) } })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    entities.push(...page);
  return entities;
};
