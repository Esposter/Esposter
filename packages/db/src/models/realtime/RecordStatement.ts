import type { SQLWrapper } from "drizzle-orm";

// Takes a statement the handle is about to run, and returns the callback that receives the rows it returned
export type RecordStatement = (statement: SQLWrapper) => (result: unknown) => void;
