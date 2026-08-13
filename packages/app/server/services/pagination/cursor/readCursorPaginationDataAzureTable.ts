import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { AzureEntity, Clause, CustomTableClient } from "@esposter/db-schema";
import type { Class } from "type-fest";

import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhereAzureTable";
import { getTopNEntities, serializeClauses } from "@esposter/db";

interface ReadCursorPaginationDataAzureTableOptions<TEntity extends AzureEntity> {
  clauses: Clause<TEntity>[];
  cursor: string;
  limit: number;
  sortBy: SortItem<keyof TEntity & string>[];
}
// One page of an Azure Table read: the cursor becomes another filter clause, and the read asks for one entity
// Beyond the page so the same round trip that fills it also answers `hasMore`.
// The caller's `clauses` are copied rather than appended to — a caller that pages twice off one array would
// Otherwise carry the first page's cursor clause into the second
export const readCursorPaginationDataAzureTable = async <TEntity extends AzureEntity>(
  tableClient: CustomTableClient<TEntity>,
  entityClass: Class<TEntity>,
  { clauses, cursor, limit, sortBy }: ReadCursorPaginationDataAzureTableOptions<TEntity>,
) => {
  const filterClauses = cursor ? [...clauses, ...getCursorWhereAzureTable<TEntity>(cursor, sortBy)] : clauses;
  const entities = await getTopNEntities(tableClient, limit + 1, entityClass, {
    filter: serializeClauses(filterClauses),
  });
  return getCursorPaginationData(entities, limit, sortBy);
};
