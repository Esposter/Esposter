import type { IdMap } from "#src/models/cutover/IdMap";
import type { SourceClient } from "#src/models/cutover/SourceClient";

import { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";
import { listTableEntities } from "#src/services/cutover/azure/listTableEntities";
import { MESSAGE_NUMBER_SCOPE } from "#src/services/cutover/constants";
import { numberRoomMessages } from "#src/services/cutover/messages/numberRoomMessages";
import { TableClient } from "@azure/data-tables";

// Numbers every room's messages from their Azure row keys, read alone. A core row that names a thread root (a thread
// Follow, a call in a thread) is copied by its root's number, so the numbers exist before copy-core runs
export const assignRoomMessageNumbers = async (
  source: SourceClient,
  connectionString: string,
  idMap: IdMap,
): Promise<void> => {
  const tableClient = TableClient.fromConnectionString(connectionString, LegacyAzureTable.Messages);
  const rooms = await source<{ id: string }[]>`SELECT "id" FROM "message"."rooms" ORDER BY "id"`;
  for (const { id: roomOldId } of rooms) {
    const roomId = idMap.newIdOf(roomOldId);
    if (roomId === undefined) continue;

    const rowKeys: string[] = [];
    // oxlint-disable-next-line no-await-in-loop -- a room's numbers are given in order, so a re-run writes the same segments
    for await (const entity of listTableEntities(tableClient, {
      filter: `PartitionKey eq '${roomOldId}'`,
      select: ["RowKey"],
    }))
      rowKeys.push(String(entity.rowKey));
    numberRoomMessages(idMap, roomId, rowKeys);
  }
  await idMap.flush(MESSAGE_NUMBER_SCOPE);
};
