import type { ReadCursorPaginationDataStreamTableOptions } from "#server/models/pagination/cursor/ReadCursorPaginationDataStreamTableOptions";
import type { AzureEntity } from "@esposter/db-schema";
import type { StreamTableClient } from "@esposter/db";
import type { Class } from "type-fest";

import { getCursorPaginationData } from "#server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhereStreamTable } from "#server/services/pagination/cursor/getCursorWhereStreamTable";
import { getTopNEntities } from "@esposter/db";

// One page of an Azure Table read: the cursor becomes another filter clause, and the read asks for one entity
// Beyond the page so the same round trip that fills it also answers `hasMore`.
// The caller's `clauses` are copied rather than appended to — a caller that pages twice off one array would
// Otherwise carry the first page's cursor clause into the second
export const readCursorPaginationDataStreamTable = async <TEntity extends AzureEntity>(
  tableClient: StreamTableClient<TEntity>,
  entityClass: Class<TEntity>,
  { clauses, cursor, limit, sortBy }: ReadCursorPaginationDataStreamTableOptions<TEntity>,
) => {
  const filterClauses = cursor ? [...clauses, ...getCursorWhereStreamTable<TEntity>(cursor, sortBy)] : clauses;
  const entities = await getTopNEntities(tableClient, limit + 1, entityClass, filterClauses);
  return getCursorPaginationData(entities, limit, sortBy);
};
