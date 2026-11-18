import type { Table } from "drizzle-orm";

// A foreign key as the table holding it sees it: the table, and what a delete of the referenced row does to it
export interface ReferencingKey {
  action?: string | undefined;
  table: Table;
}
