import type { ResourceType } from "#src/models/resource/ResourceType";

import { StreamTable } from "#src/models/streams/StreamTable";
import { ResourceOwnedTablesMap } from "#src/services/resource/ResourceOwnedTablesMap";

// Every partition keyed by a resource id: its activity trail, its view counters, and whatever its
// Type owns — the one list both the interactive purge and the timer sweep destroy
export const getResourceOwnedTableNames = (type: ResourceType): StreamTable[] => [
  StreamTable.ResourceActivity,
  StreamTable.ResourceViews,
  ...ResourceOwnedTablesMap[type],
];
