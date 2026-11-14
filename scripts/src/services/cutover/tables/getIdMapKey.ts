import type { StreamTable } from "@esposter/db-schema";

// A JSON array rather than a joined string, so no table or key can read as another
export const getIdMapKey = (azureTable: StreamTable, partitionKey: string, rowKey: string): string =>
  JSON.stringify([azureTable, partitionKey, rowKey]);
