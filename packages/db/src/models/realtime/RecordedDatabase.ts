import type { Database } from "@esposter/db-schema";
import type { SQLWrapper } from "drizzle-orm";

// A request's database handle, and the statements it awaited through the handle in the order it awaited them
export interface RecordedDatabase {
  database: Database;
  statements: SQLWrapper[];
}
