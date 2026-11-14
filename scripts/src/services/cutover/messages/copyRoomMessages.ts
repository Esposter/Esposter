import type { CutoverCheckpoint } from "#src/models/cutover/CutoverCheckpoint";
import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { IdMap } from "#src/models/cutover/IdMap";
import type { LegacyMessage } from "#src/models/cutover/LegacyMessage";
import type { LegacyMessageEmoji } from "#src/models/cutover/LegacyMessageEmoji";
import type { LegacyScheduledJob } from "#src/models/cutover/LegacyScheduledJob";
import type { R2Client } from "#src/models/cutover/R2Client";
import type { TableParents } from "#src/models/cutover/TableParents";

import { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";
import { legacyMessageSchema } from "#src/models/cutover/LegacyMessage";
import { legacyMessageEmojiSchema } from "#src/models/cutover/LegacyMessageEmoji";
import { callFunctionsRoute } from "#src/services/cutover/callFunctionsRoute";
import { readCheckpoint } from "#src/services/cutover/checkpoint/readCheckpoint";
import { writeCheckpoint } from "#src/services/cutover/checkpoint/writeCheckpoint";
import { MESSAGE_NUMBER_SCOPE, ROOM_IMPORT_PATH } from "#src/services/cutover/constants";
import { buildRoomImport } from "#src/services/cutover/messages/buildRoomImport";
import { numberRoomMessages } from "#src/services/cutover/messages/numberRoomMessages";
import { toRoomScheduledMessages } from "#src/services/cutover/messages/toRoomScheduledMessages";
import { DELTA_CLOCK_MARGIN_MS } from "#src/services/cutover/objects/constants";
import { COPY_TABLES_UNIT_PREFIX } from "#src/services/cutover/tables/constants";
import { listMapperEntities } from "#src/services/cutover/tables/listMapperEntities";
import { TableClient } from "@azure/data-tables";
import { roomImportSchema } from "@esposter/db-schema";
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
  // The old estate's pending jobs, read inside the freeze only and empty for the live copy: a job cancelled after the
  // Pre-copy would otherwise stay in its room's object, since no route deletes one
  scheduledJobs: LegacyScheduledJob[];
  secret: string;
}

interface CopyRoomOptions {
  filter?: string;
  roomId: string;
  roomOldId: string;
}

// Imports the messages, reactions and pending scheduled messages of every room into the room's own object, through the functions Worker's cutover route.
// A room's messages are numbered in createdAt order, and each number is kept in the id map before the import writes it, so a re-run or the delta writes the same numbers.
// The full copy runs while the app is live and records when it began; the delta imports the rooms' changed rows, and every write is an upsert, so a re-run writes the same rows again rather than adding to them.
// A delta does not remove a message Azure no longer lists: no route deletes a message from an object yet
export const copyRoomMessages = async (options: CopyRoomMessagesOptions): Promise<void> => {
  const { archiveBucket, client, connectionString, delta, functionsUrl, idMap, parents, scheduledJobs, secret } =
    options;
  const unit = `${COPY_TABLES_UNIT_PREFIX}/${LegacyAzureTable.Messages}`;
  const checkpoint: CutoverCheckpoint = (await readCheckpoint(client, archiveBucket, unit)) ?? {};
  const roomOldIds = idMap.oldIds().filter((oldId) => {
    const roomId = idMap.newIdOf(oldId);
    return roomId !== undefined && parents.roomIds.has(roomId);
  });

  const copyRoom = async ({ filter, roomId, roomOldId }: CopyRoomOptions): Promise<void> => {
    const roomFilter =
      filter === undefined ? `PartitionKey eq '${roomOldId}'` : `PartitionKey eq '${roomOldId}' and ${filter}`;
    const messages: { message: LegacyMessage; timestamp?: Date }[] = [];
    for await (const { entity, timestamp } of listMapperEntities(
      TableClient.fromConnectionString(connectionString, LegacyAzureTable.Messages),
      LegacyAzureTable.Messages,
      { filter: roomFilter },
    ))
      messages.push({ message: legacyMessageSchema.parse(entity), timestamp });
    const emojis: LegacyMessageEmoji[] = [];
    for await (const { entity } of listMapperEntities(
      TableClient.fromConnectionString(connectionString, LegacyAzureTable.MessagesMetadata),
      LegacyAzureTable.MessagesMetadata,
      { filter: roomFilter },
    ))
      emojis.push(legacyMessageEmojiSchema.parse(entity));

    // The numbers are kept before anything reads them: the scheduled messages' replies resolve their roots among them, and the room object is written with them.
    // So a re-run gets the same numbers
    numberRoomMessages(
      idMap,
      roomId,
      messages.map(({ message }) => message.rowKey),
    );
    await idMap.flush(MESSAGE_NUMBER_SCOPE);
    const getNumber = (rowKey: string) => idMap.getMessageNumber(roomId, rowKey);
    const scheduledMessages = toRoomScheduledMessages({ getNumber, idMap, jobs: scheduledJobs, parents, roomId });
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
