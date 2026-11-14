import type { StreamTable, StreamTableEntityMap, StandardMessageEntity } from "@esposter/db-schema";
import type { StreamTableClient } from "#src/models/streams/StreamTableClient";
import type { Promisable } from "type-fest";

import { updateRoomMessagesByUser } from "#src/services/message/updateRoomMessagesByUser";

import { StandardMessageEntityPropertyNames, BinaryOperator, CompositeKeyPropertyNames } from "@esposter/db-schema";

// Erases what a user said in a room and soft-deletes it, live or already soft-deleted: a moderation ban hides a message
// Without clearing its text, so a pass that read only live rows would leave that text behind. The text, the files and
// The link preview are what the message said, so all three are cleared. The row stays in place, as a soft delete leaves
// It, so the room's ascending index keeps joining to it. The write is a Replace, because a Merge cannot clear the link
// Preview and would leave it standing; a null preview in the Replace leaves no property behind, as the router's clear does
export const eraseRoomMessagesByUser = (
  messageClient: StreamTableClient<StreamTableEntityMap[StreamTable.Messages]>,
  roomId: string,
  targetUserId: string,
  onBatchErased: (batch: StandardMessageEntity[]) => Promisable<void>,
): Promise<void> =>
  updateRoomMessagesByUser(
    messageClient,
    [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: roomId },
      { key: StandardMessageEntityPropertyNames.userId, operator: BinaryOperator.Eq, value: targetUserId },
    ],
    "Replace",
    (_message, now) => ({ deletedAt: now, files: [], linkPreviewResponse: null, message: "" }),
    onBatchErased,
  );
