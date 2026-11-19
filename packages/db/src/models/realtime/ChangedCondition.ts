import type { SQL, Table } from "drizzle-orm";

// The rows of a table a delete changes in place, without removing them, as the condition their keys reach from a removed row
export interface ChangedCondition {
  condition?: SQL | undefined;
  table: Table;
}
