import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";
import type { MessageEntity, StandardCreateMessageInput } from "@esposter/db-schema";

import { useEventGridPublisherClient } from "@@/server/composables/azure/eventGrid/useEventGridPublisherClient";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { roomEventEmitter } from "@@/server/services/message/events/roomEventEmitter";
import { userToRoomEventEmitter } from "@@/server/services/message/events/userToRoomEventEmitter";
import { assertCanCreateMessage } from "@@/server/services/message/moderation/assertCanCreateMessage";
import { updateUserToRoom } from "@@/server/services/message/updateUserToRoom";
import { createMessage, createReplyThreadFollows, incrementMentionCounts } from "@esposter/db";
import {
  AppNotificationType,
  AzureTable,
  DatabaseEntityType,
  publishNotification,
  roomsInMessage,
} from "@esposter/db-schema";
import { getResultAsync, noop, NotFoundError } from "@esposter/shared";
import { eq } from "drizzle-orm";

export const createUserMessage = async (
  db: Context["db"],
  { session, user }: GetSessionPayload,
  input: StandardCreateMessageInput,
): Promise<MessageEntity> => {
  await assertCanCreateMessage(db, user.id, input.roomId, input.message);
  const now = new Date();
  // The slowmode clock is what the NEXT send is checked against, so it advances with the guards rather than
  // After the write: a failed update behind a successful write leaves a stale lastMessageAt that keeps passing
  // And slowmode silently stops applying, while advancing first can only cost one window on a write that throws
  await updateUserToRoom(db, user.id, {
    lastMessageAt: now,
    roomId: input.roomId,
  });
  const messageClient = await useTableClient(AzureTable.Messages);
  const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
  const newMessageEntity = await createMessage(messageClient, messageAscendingClient, {
    ...input,
    userId: user.id,
  });
  messageEventEmitter.emit("createMessage", [[newMessageEntity], { sessionId: session.id }]);
  // Best-effort after the Table write — a failed increment loses one badge count, never a message.
  const mentionedUsersToRooms = await getResultAsync(() => incrementMentionCounts(db, newMessageEntity))
    .orTee(console.error)
    .unwrapOr([]);
  for (const mentionedUserToRoom of mentionedUsersToRooms)
    userToRoomEventEmitter.emit("updateUserToRoom", mentionedUserToRoom);
  // Post-persist and best-effort — a follow failure must never fail the reply that already landed — but
  // Strictly before the publish below, for the reason `createReplyThreadFollows` states
  await getResultAsync(() => createReplyThreadFollows(db, messageClient, newMessageEntity)).match(noop, console.error);
  // One notification for the send, thread reply or not: the room's own recipients and the thread's followers are
  // One recipient set resolved by ProcessNotification, so a follower is never notified twice and this path runs
  // No recipient query of its own. Best-effort after the Table write — a failed publish loses one notification,
  // Never the message that landed
  await getResultAsync(() =>
    publishNotification(useEventGridPublisherClient(), {
      message: {
        message: newMessageEntity.message,
        partitionKey: newMessageEntity.partitionKey,
        rowKey: newMessageEntity.rowKey,
        userId: newMessageEntity.userId,
      },
      threadRootRowKey: newMessageEntity.replyRowKey,
      type: AppNotificationType.Message,
    }),
  ).match(noop, console.error);
  // Best-effort after the Table write — a failed touch leaves the room list sorted one send behind until the
  // Next one lands, never costs the message that already landed
  const updatedRoom = await getResultAsync(
    async () =>
      (
        await db.update(roomsInMessage).set({ updatedAt: now }).where(eq(roomsInMessage.id, input.roomId)).returning()
      )[0],
  )
    .orTee(console.error)
    .unwrapOr(undefined);
  // A zero-row update is not a rejection, so it arrives here as `undefined` rather than through `orTee`: the room
  // The message was just written into is gone. Still best-effort — the message landed and the caller keeps it —
  // But never silent, or the room list simply stops re-sorting with nothing anywhere saying why
  if (updatedRoom) roomEventEmitter.emit("updateRoom", updatedRoom);
  else console.error(new NotFoundError(DatabaseEntityType.Room, input.roomId));
  return newMessageEntity;
};
