import type { RecordedRows } from "#src/models/realtime/RecordedRows";
import type { SQLWrapper } from "drizzle-orm";

// A statement the handle awaited, with the rows it returned: a select's rows, or a write's rows when it asks for
// RETURNING. `before` holds the rows of the reads a write makes before it runs, which name the values its rows held
// Before it
export interface RecordedStatement {
  before: RecordedRows[];
  rows: unknown[];
  statement: SQLWrapper;
}
