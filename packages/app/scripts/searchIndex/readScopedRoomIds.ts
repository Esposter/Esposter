import type { AzureTable, AzureTableEntityMap, CustomTableClient } from "@esposter/db-schema";

import { serializeKey } from "@esposter/db";
import { AZURE_MAX_PAGE_SIZE, CompositeKeyPropertyNames } from "@esposter/db-schema";
import { normalizeString } from "@esposter/shared";
// Omitting ROOM_IDS covers every room that has messages, which costs a keys-only walk of the whole table.
export const readScopedRoomIds = async (
  messageClient: CustomTableClient<AzureTableEntityMap[AzureTable.Messages]>,
): Promise<string[]> => {
  const scopedRoomIds = normalizeString(process.env.ROOM_IDS)
    .split(",")
    .map((roomId) => normalizeString(roomId))
    .filter(Boolean);
  if (scopedRoomIds.length > 0) return scopedRoomIds;

  const roomIds = new Set<string>();
  const select = [serializeKey(CompositeKeyPropertyNames.partitionKey)];
  for await (const page of messageClient
    .listEntities({ queryOptions: { select } })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    for (const { partitionKey } of page) if (partitionKey) roomIds.add(partitionKey);
  return [...roomIds];
};
