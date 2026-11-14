import type { StreamTable, StreamTableEntityMap, Database } from "@esposter/db-schema";
import type { StreamTableClient } from "@esposter/db";

// Everything the seed writes through, injected so a test drives it over an in-memory database and in-memory tables.
// The database address and storage connection string are the targets the gates read before any write
export interface SeedDevDatasetInput {
  databaseUrl: string;
  db: Database;
  messageClient: StreamTableClient<StreamTableEntityMap[StreamTable.Messages]>;
  storageConnectionString: string;
}
