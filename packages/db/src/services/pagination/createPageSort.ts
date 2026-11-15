import type { PageSort } from "@esposter/db-schema";
import type { SQLWrapper } from "drizzle-orm";

// A sort bound to the columns it compares: a table's own, or a subquery's for an order that is computed. The keys are the
// Row's own property names, so the cursor is read off the row a query answers
export interface BoundPageSort<TKey extends string = string> extends PageSort<TKey> {
  columns: Record<TKey, SQLWrapper>;
}

export const createPageSort = <TKey extends string>(
  columns: Record<TKey, SQLWrapper>,
  sort: PageSort<TKey>,
): BoundPageSort<TKey> => ({ ...sort, columns });
