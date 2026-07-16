import type { TableEntityQueryOptions } from "@azure/data-tables";
import type { CompositeKey, CustomTableClient } from "@esposter/db-schema";

import { serializeKey } from "@/services/azure/table/serializeKey";
import { AZURE_MAX_PAGE_SIZE, CompositeKeyPropertyNames } from "@esposter/db-schema";

// Azure Table Storage has no count API, so every matching row still has to be walked; the keys-only
// Projection keeps that walk at its smallest possible payload. It is never free — reach for it only once
// A capped read is already known to have truncated, never on the happy path.
export const countEntities = async <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  queryOptions?: TableEntityQueryOptions,
): Promise<number> => {
  const select = [serializeKey(CompositeKeyPropertyNames.rowKey)];
  let total = 0;
  for await (const page of tableClient
    .listEntities({ queryOptions: { ...queryOptions, select } })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    total += page.length;
  return total;
};
