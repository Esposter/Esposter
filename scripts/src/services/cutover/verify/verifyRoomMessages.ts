import type { VerifyRoomMessagesOptions } from "#src/models/cutover/VerifyRoomMessagesOptions";

import { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";
import { callFunctionsRoute } from "#src/services/cutover/callFunctionsRoute";
import { COPY_CONCURRENCY, ROOM_SUMMARY_PATH } from "#src/services/cutover/constants";
import { listMapperEntities } from "#src/services/cutover/tables/listMapperEntities";
import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";
import { TableClient } from "@azure/data-tables";
import { roomSummarySchema } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Checks each room's object against Azure: how many messages it holds, and its newest number, which is the highest number any of the room's messages was given.
// Nothing is written
export const verifyRoomMessages = async (options: VerifyRoomMessagesOptions): Promise<void> => {
  const { connectionString, functionsUrl, idMap, parents, secret } = options;
  const tableClient = TableClient.fromConnectionString(connectionString, LegacyAzureTable.Messages);
  await forEachConcurrently(idMap.oldIds(), COPY_CONCURRENCY, async (roomOldId) => {
    const roomId = idMap.newIdOf(roomOldId);
    if (roomId === undefined || !parents.roomIds.has(roomId)) return;

    let messageCount = 0;
    let newestId: null | number = null;
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
    const summary = roomSummarySchema.parse(
      await callFunctionsRoute(functionsUrl, secret, ROOM_SUMMARY_PATH, { roomId }),
    );
    if (summary.messageCount !== messageCount || summary.newestId !== newestId)
      throw new InvalidOperationError(
        Operation.Read,
        roomId,
        `holds ${summary.messageCount} messages, newest ${summary.newestId}, but Azure gives ${messageCount}, newest ${newestId}`,
      );
  });
};
