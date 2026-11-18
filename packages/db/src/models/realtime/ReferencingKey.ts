import type { Column, Table } from "drizzle-orm";

// A column a foreign key holds, paired with the column of the referenced row its value is taken from. The keys are the
// Names a scope declaration and a returned row use, and the columns are the table's own, which a subquery selects by
export interface ReferencingColumn {
  childColumn: Column;
  column: string;
  parentColumn: string;
  referencedColumn: Column;
}

// A foreign key as the table holding it sees it: the table, what a delete of the referenced row does to it, and the
// Columns it holds
export interface ReferencingKey {
  action?: string | undefined;
  columns: ReferencingColumn[];
  table: Table;
}
