import type { TableEntityQueryOptions } from "@azure/data-tables";
import type { CompositeKey } from "@esposter/azure";
import type { CustomTableClient } from "@esposter/db-schema";

import { AZURE_MAX_PAGE_SIZE, CompositeKeyPropertyNames, serializeKey } from "@esposter/azure";

// Azure Table Storage has no count API, so every matching row still has to be walked; the keys-only
// Projection keeps that walk at its smallest possible payload. It is never free — reach for it only once
// A capped read is already known to have truncated, never on the happy path. A bound on the walk makes the
// Result a floor rather than an exact total.
export const readEntitiesCount = async <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  queryOptions?: TableEntityQueryOptions,
  maxCount = Number.POSITIVE_INFINITY,
): Promise<number> => {
  const select = [serializeKey(CompositeKeyPropertyNames.rowKey)];
  let total = 0;
  for await (const page of tableClient
    .listEntities({ queryOptions: { ...queryOptions, select } })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE })) {
    total += page.length;
    if (total >= maxCount) return maxCount;
  }
  return total;
};
