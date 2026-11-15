import type { BoundPageSort } from "#src/services/pagination/createPageSort";
import type { PageCursor } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { SortOrder } from "@esposter/db-schema";
import { sql } from "drizzle-orm";

// The rows after the cursor in the list's order, or before it for a backward cursor, as one SQLite row value: the sort
// Runs one direction, so `(a, b, id) < (?, ?, ?)` is the whole comparison and one composite index serves it. The start
// Of the list has no condition
export const getPageWhere = <TKey extends string>(
  { columns, keys, order }: BoundPageSort<TKey>,
  { isBackward, values }: PageCursor,
): SQL | undefined => {
  if (values.length === 0) return undefined;

  const isAfter = (order === SortOrder.Asc) !== isBackward;
  const left = sql.join(
    keys.map((key) => columns[key]),
    sql`, `,
  );
  const right = sql.join(
    values.map((value) => sql`${value}`),
    sql`, `,
  );
  return isAfter ? sql`(${left}) > (${right})` : sql`(${left}) < (${right})`;
};
