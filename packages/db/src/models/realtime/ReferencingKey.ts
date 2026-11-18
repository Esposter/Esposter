import type { Table } from "drizzle-orm";

// A column a foreign key holds, paired with the column of the referenced row its value is taken from. Both are keys in
// Their tables' definitions, which is the name a scope declaration and a returned row use
export interface ReferencingColumn {
  column: string;
  parentColumn: string;
}

// A foreign key as the table holding it sees it: the table, what a delete of the referenced row does to it, and the
// Columns it holds
export interface ReferencingKey {
  action?: string | undefined;
  columns: ReferencingColumn[];
  table: Table;
}
