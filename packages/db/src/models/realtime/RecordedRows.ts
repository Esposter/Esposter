import type { Table } from "drizzle-orm";

// The rows a read resolved to, with the table they are of
export interface RecordedRows {
  rows: unknown[];
  table: Table;
}
