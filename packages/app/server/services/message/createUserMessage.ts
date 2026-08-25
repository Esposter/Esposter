import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";
import type { MessageEntity, StandardCreateMessageInput } from "@esposter/db-schema";

import { useEventGridPublisherClient } from "@@/server/composables/azure/eventGrid/useEventGridPublisherClient";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { roomEventEmitter } from "@@/server/services/message/events/roomEventEmitter";
import { userToRoomEventEmitter } from "@@/server/services/message/events/userToRoomEventEmitter";
import { assertCanCreateMessage } from "@@/server/services/message/moderation/assertCanCreateMessage";
import { createThreadFollow } from "@@/server/services/message/thread/createThreadFollow";
import { updateUserToRoom } from "@@/server/services/message/updateUserToRoom";
import { createMessage, getEntity, incrementMentionCounts } from "@esposter/db";
import {
  AppNotificationType,
  AzureTable,
  DatabaseEntityType,
  publishNotification,
  roomsInMessage,
  StandardMessageEntity,
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
  // A reply auto-follows its thread (Discord behaviour). Post-persist and best-effort — a follow failure must
  // Never fail the reply that already landed — but strictly BEFORE the publish below, because the follow rows are
  // What ProcessNotification reads to decide who the reply reaches
  if (newMessageEntity.replyRowKey) {
    const threadRootRowKey = newMessageEntity.replyRowKey;
    // The root's author is followed alongside the replier: Discord tells you when someone replies to your
    // Message, and following only repliers leaves the one member the thread belongs to as the only one the
    // Pipeline never reaches — while anyone who merely replied once keeps being told
    const threadRootMessage = await getResultAsync(() =>
      getEntity(messageClient, StandardMessageEntity, newMessageEntity.partitionKey, threadRootRowKey),
    )
      .orTee(console.error)
      .unwrapOr(null);
    const roomId = newMessageEntity.partitionKey;
    // The replier's own send is their own decision, so it undoes an unfollow they made earlier
    const threadFollows = [createThreadFollow(db, { roomId, threadRootRowKey, userId: user.id }, true)];
    // Guarded on the author existing, not merely on the root being read: a webhook root has no author at all
    // (`WebhookMessageEntity` declares `userId?: undefined`) and the follow row's `userId` is NOT NULL, so an
    // Unguarded push turns every reply to a webhook message into a constraint violation. The root's author did
    // Not do this — somebody else replied — so their follow is only ever created, never restored: an author who
    // Turned the bell off on their own thread stays off it
    if (threadRootMessage?.userId && threadRootMessage.userId !== user.id)
      threadFollows.push(createThreadFollow(db, { roomId, threadRootRowKey, userId: threadRootMessage.userId }, false));
    await getResultAsync(() => Promise.all(threadFollows)).match(noop, console.error);
  }
  // One notification for the send, thread reply or not: the room's own recipients and the thread's followers are
  // One recipient set resolved by ProcessNotification, so a reply can no longer notify a follower twice and this
  // Path no longer pays for a recipient query it was only running to decide whether to publish at all.
  // Best-effort after the Table write — a failed publish loses one notification, never the message that landed
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
