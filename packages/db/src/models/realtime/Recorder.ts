import type { RecordStatement } from "#src/models/realtime/RecordStatement";
import type { Database } from "@esposter/db-schema";

// What a recording handle needs: the database the statements run on, unrecorded, so the reads a write makes before it
// Are not recorded as the request's own, and the callback that records each statement
export interface Recorder {
  database: Database;
  record: RecordStatement;
}
