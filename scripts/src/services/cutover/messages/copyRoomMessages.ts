import type { CutoverCheckpoint } from "#src/models/cutover/CutoverCheckpoint";
import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { IdMap } from "#src/models/cutover/IdMap";
import type { LegacyMessage } from "#src/models/cutover/LegacyMessage";
import type { LegacyMessageEmoji } from "#src/models/cutover/LegacyMessageEmoji";
import type { R2Client } from "#src/models/cutover/R2Client";
import type { TableParents } from "#src/models/cutover/TableParents";

import { legacyMessageSchema } from "#src/models/cutover/LegacyMessage";
import { legacyMessageEmojiSchema } from "#src/models/cutover/LegacyMessageEmoji";
import { createTableClient } from "#src/services/cutover/azure/createTableClient";
import { callFunctionsRoute } from "#src/services/cutover/callFunctionsRoute";
import { readCheckpoint } from "#src/services/cutover/checkpoint/readCheckpoint";
import { writeCheckpoint } from "#src/services/cutover/checkpoint/writeCheckpoint";
import { ROOM_IMPORT_PATH, MESSAGE_NUMBER_SCOPE } from "#src/services/cutover/constants";
import { DELTA_CLOCK_MARGIN_MS } from "#src/services/cutover/objects/constants";
import { buildRoomImport } from "#src/services/cutover/messages/buildRoomImport";
import { readScheduledRoomMessages } from "#src/services/cutover/messages/readScheduledRoomMessages";
import { COPY_TABLES_UNIT_PREFIX } from "#src/services/cutover/tables/constants";
import { getReverseTickedMilliseconds } from "#src/services/cutover/tables/getReverseTickedMilliseconds";
import { listMapperEntities } from "#src/services/cutover/tables/listMapperEntities";
import { roomImportSchema } from "@esposter/db-schema";
import { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";
import { InvalidOperationError, Operation } from "@esposter/shared";

export interface CopyRoomMessagesOptions {
  archiveBucket: string;
  client: R2Client;
  connectionString: string;
  delta: boolean;
  executor: D1Executor;
  functionsUrl: string;
  idMap: IdMap;
  parents: TableParents;
  secret: string;
}

interface CopyRoomOptions {
  filter: string | undefined;
  roomId: string;
  roomOldId: string;
}

// Imports the messages, reactions and pending scheduled messages of every room into the room's own object, through the functions Worker's
// cutover route. A room's messages are numbered in createdAt order, and each number is kept in the id map before the import writes it, so a
// re-run or the delta writes the same numbers. The full copy runs while the app is live and records when it began; the delta imports the
// rooms' changed rows, and every write is an upsert, so a re-run writes the same rows again rather than adding to them. A delta does not
// remove a message Azure no longer lists: no route deletes a message from an object yet
export const copyRoomMessages = async (options: CopyRoomMessagesOptions): Promise<void> => {
  const { archiveBucket, client, connectionString, delta, executor, functionsUrl, idMap, parents, secret } = options;
  const unit = `${COPY_TABLES_UNIT_PREFIX}/${LegacyAzureTable.Messages}`;
  const checkpoint: CutoverCheckpoint = (await readCheckpoint(client, archiveBucket, unit)) ?? {};
  const roomOldIds = idMap.oldIds().filter((oldId) => {
    const roomId = idMap.newIdOf(oldId);
    return roomId !== undefined && parents.roomIds.has(roomId);
  });

  const copyRoom = async ({ filter, roomId, roomOldId }: CopyRoomOptions): Promise<void> => {
    const roomFilter =
      filter === undefined ? `PartitionKey eq '${roomOldId}'` : `PartitionKey eq '${roomOldId}' and ${filter}`;
    const messages: { message: LegacyMessage; timestamp: Date | undefined }[] = [];
    for await (const { entity, timestamp } of listMapperEntities(
      createTableClient(connectionString, LegacyAzureTable.Messages),
      LegacyAzureTable.Messages,
      { filter: roomFilter },
    ))
      messages.push({ message: legacyMessageSchema.parse(entity), timestamp });
    const emojis: LegacyMessageEmoji[] = [];
    for await (const { entity } of listMapperEntities(
      createTableClient(connectionString, LegacyAzureTable.MessagesMetadata),
      LegacyAzureTable.MessagesMetadata,
      { filter: roomFilter },
    ))
      emojis.push(legacyMessageEmojiSchema.parse(entity));

    // The numbers are kept before anything reads them: the scheduled messages' replies find their roots among them, and the room object is
    // written with them, so a re-run finds the same numbers
    idMap.numberMessages(
      roomId,
      messages.map(({ message }) => ({
        createdAt: new Date(getReverseTickedMilliseconds(message.rowKey)),
        rowKey: message.rowKey,
      })),
    );
    await idMap.flush(MESSAGE_NUMBER_SCOPE);
    const getNumber = (rowKey: string) => idMap.getMessageNumber(roomId, rowKey);
    const scheduledMessages = await readScheduledRoomMessages(
      executor,
      roomId,
      (text) => idMap.rewrite(text),
      getNumber,
    );
    if (messages.length === 0 && emojis.length === 0 && scheduledMessages.length === 0) return;

    const roomImport = roomImportSchema.parse(
      buildRoomImport({ emojis, getNumber, idMap, messages, parents, scheduledMessages }),
    );
    await callFunctionsRoute(functionsUrl, secret, ROOM_IMPORT_PATH, { roomId, ...roomImport });
  };
  const copyRooms = async (filter: string | undefined): Promise<void> => {
    for (const roomOldId of roomOldIds) {
      const roomId = idMap.newIdOf(roomOldId);
      if (roomId === undefined) continue;

      // oxlint-disable-next-line no-await-in-loop -- a room's import is written before the next room's messages are read
      await copyRoom({ filter, roomId, roomOldId });
    }
  };

  if (!delta) {
    if (checkpoint.completedAt) return;

    // Kept once set: the delta measures changes from this instant, so a re-run must not move it
    const preCopyStartedAt = checkpoint.preCopyStartedAt ?? new Date().toISOString();
    await writeCheckpoint(client, archiveBucket, unit, { ...checkpoint, preCopyStartedAt });
    await copyRooms(undefined);
    await writeCheckpoint(client, archiveBucket, unit, {
      ...checkpoint,
      completedAt: new Date().toISOString(),
      preCopyStartedAt,
    });
    return;
  }

  if (!checkpoint.preCopyStartedAt)
    throw new InvalidOperationError(
      Operation.Read,
      unit,
      "has no pre-copy to take changes from: copy-tables must run first",
    );
  if (!checkpoint.completedAt)
    throw new InvalidOperationError(Operation.Read, unit, "has an unfinished full copy: copy-tables must finish first");
  const changedSince = new Date(Date.parse(checkpoint.preCopyStartedAt) - DELTA_CLOCK_MARGIN_MS).toISOString();
  await copyRooms(`Timestamp gt datetime'${changedSince}'`);
  await writeCheckpoint(client, archiveBucket, unit, { ...checkpoint, deltaCompletedAt: new Date().toISOString() });
};
