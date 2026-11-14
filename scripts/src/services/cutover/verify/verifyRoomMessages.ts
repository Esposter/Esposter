import type { VerifyRoomMessagesOptions } from "#src/models/cutover/VerifyRoomMessagesOptions";

import { createTableClient } from "#src/services/cutover/azure/createTableClient";
import { callFunctionsRoute } from "#src/services/cutover/callFunctionsRoute";
import { ROOM_SUMMARY_PATH } from "#src/services/cutover/constants";
import { listMapperEntities } from "#src/services/cutover/tables/listMapperEntities";
import { roomSummarySchema } from "@esposter/db-schema";
import { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Checks each room's object against Azure: how many messages it holds, and its newest number, which is the highest number any of the room's
// messages was given. Nothing is written
export const verifyRoomMessages = async (options: VerifyRoomMessagesOptions): Promise<void> => {
  const { connectionString, functionsUrl, idMap, parents, secret } = options;
  const tableClient = createTableClient(connectionString, LegacyAzureTable.Messages);
  for (const roomOldId of idMap.oldIds()) {
    const roomId = idMap.newIdOf(roomOldId);
    if (roomId === undefined || !parents.roomIds.has(roomId)) continue;

    let messageCount = 0;
    let newestId: number | null = null;
    for await (const { entity } of listMapperEntities(tableClient, LegacyAzureTable.Messages, {
      filter: `PartitionKey eq '${roomOldId}'`,
    })) {
      const number = idMap.getMessageNumber(roomId, entity.rowKey);
      if (number === undefined)
        throw new InvalidOperationError(
          Operation.Read,
          roomId,
          `holds the message ${entity.rowKey}, which was never numbered`,
        );
      messageCount += 1;
      newestId = Math.max(newestId ?? number, number);
    }
    // oxlint-disable-next-line no-await-in-loop -- a room's summary is checked before the next room's messages are read
    const summary = roomSummarySchema.parse(
      await callFunctionsRoute(functionsUrl, secret, ROOM_SUMMARY_PATH, { roomId }),
    );
    if (summary.messageCount !== messageCount || summary.newestId !== newestId)
      throw new InvalidOperationError(
        Operation.Read,
        roomId,
        `holds ${summary.messageCount} messages, newest ${summary.newestId}, but Azure gives ${messageCount}, newest ${newestId}`,
      );
  }
};
