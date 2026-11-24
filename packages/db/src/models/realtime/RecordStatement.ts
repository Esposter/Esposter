import type { RecordedRows } from "#src/models/realtime/RecordedRows";
import type { SQLWrapper } from "drizzle-orm";

// Takes a statement the handle is about to run, and returns the callback that receives the rows it returned and the
// Rows of the reads it made before it ran
export type RecordStatement = (statement: SQLWrapper) => (result: unknown, before: RecordedRows[]) => void;
