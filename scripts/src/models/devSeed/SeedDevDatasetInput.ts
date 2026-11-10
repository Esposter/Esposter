import type { AzureTable, AzureTableEntityMap, CustomTableClient, Database } from "@esposter/db-schema";

// Everything the seed writes through, injected so a test drives it over an in-memory database and in-memory tables.
// The database name and storage connection string are the targets the gates read before any write
export interface SeedDevDatasetInput {
  databaseName: string;
  db: Database;
  messageAscendingClient: CustomTableClient<AzureTableEntityMap[AzureTable.MessagesAscending]>;
  messageClient: CustomTableClient<AzureTableEntityMap[AzureTable.Messages]>;
  storageConnectionString: string;
}
