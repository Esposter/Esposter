import { TableClient } from "@azure/data-tables";

// One Azure Table of the legacy estate, read through its connection string, which is never logged or stored
export const createTableClient = (connectionString: string, tableName: string): TableClient =>
  TableClient.fromConnectionString(connectionString, tableName);
