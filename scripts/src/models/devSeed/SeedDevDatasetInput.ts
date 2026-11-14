import type { StreamTableClient } from "@esposter/db";
import type { Database, StreamTable, StreamTableEntityMap } from "@esposter/db-schema";

// Everything the seed writes through, injected so a test drives it over an in-memory database
export interface SeedDevDatasetInput {
  db: Database;
  messageClient: StreamTableClient<StreamTableEntityMap[StreamTable.Messages]>;
}
