import type { BoundPageSort } from "#src/services/pagination/createPageSort";
import type { PageCursor } from "@esposter/db-schema";

import { SortOrder } from "@esposter/db-schema";
import { asc, desc } from "drizzle-orm";

// The order a page is read in: the list's own, or its reverse for a backward cursor, whose rows toPage turns back
export const getPageOrderBy = <TKey extends string>(
  { columns, keys, order }: BoundPageSort<TKey>,
  { isBackward }: PageCursor,
) => {
  const isAscending = (order === SortOrder.Asc) !== isBackward;
  return keys.map((key) => (isAscending ? asc(columns[key]) : desc(columns[key])));
};
