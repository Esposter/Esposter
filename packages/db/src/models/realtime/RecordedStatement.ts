import type { SQLWrapper } from "drizzle-orm";

// A statement the handle awaited, with the rows it returned: a select's rows, or a write's rows when it asks for RETURNING
export interface RecordedStatement {
  rows: unknown[];
  statement: SQLWrapper;
}
