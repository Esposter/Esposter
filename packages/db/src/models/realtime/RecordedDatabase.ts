import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { Database } from "@esposter/db-schema";

// A request's database handle, and the statements it awaited through the handle in the order it awaited them
export interface RecordedDatabase {
  database: Database;
  statements: RecordedStatement[];
}
