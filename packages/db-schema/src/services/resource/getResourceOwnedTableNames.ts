import type { ResourceType } from "#src/models/resource/ResourceType";

import { AzureTable } from "#src/models/azure/table/AzureTable";
import { ResourceOwnedTablesMap } from "#src/services/resource/ResourceOwnedTablesMap";

// Every partition keyed by a resource id: its activity trail, its view counters, and whatever its
// Type owns — the one list both the interactive purge and the timer sweep destroy
export const getResourceOwnedTableNames = (type: ResourceType): AzureTable[] => [
  AzureTable.ResourceActivity,
  AzureTable.ResourceViews,
  ...ResourceOwnedTablesMap[type],
];
