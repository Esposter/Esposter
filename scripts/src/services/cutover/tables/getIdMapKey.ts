import type { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";

// A JSON array rather than a joined string, so no table or key can read as another
export const getIdMapKey = (azureTable: LegacyAzureTable, partitionKey: string, rowKey: string): string =>
  JSON.stringify([azureTable, partitionKey, rowKey]);
