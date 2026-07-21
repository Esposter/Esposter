import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";
import type {
  MessageEntity,
  NotificationOptions,
  PushNotificationEventGridData,
  StandardCreateMessageInput,
} from "@esposter/db-schema";

import { useEventGridPublisherClient } from "@@/server/composables/azure/eventGrid/useEventGridPublisherClient";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { roomEventEmitter } from "@@/server/services/message/events/roomEventEmitter";
import { userToRoomEventEmitter } from "@@/server/services/message/events/userToRoomEventEmitter";
import { assertCanCreateMessage } from "@@/server/services/message/moderation/assertCanCreateMessage";
import { createThreadFollow } from "@@/server/services/message/thread/createThreadFollow";
import { notifyThreadReplyFollowers } from "@@/server/services/message/thread/notifyThreadReplyFollowers";
import { updateUserToRoom } from "@@/server/services/message/updateUserToRoom";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { createMessage, getPushSubscriptionsForMessage, incrementMentionCounts } from "@esposter/db";
import {
  AzureFunction,
  AzureTable,
  createEventGridEvent,
  DatabaseEntityType,
  roomsInMessage,
} from "@esposter/db-schema";
import { getResultAsync, Operation } from "@esposter/shared";
import { eq } from "drizzle-orm";

export const createUserMessage = async (
  db: Context["db"],
  { session, user }: GetSessionPayload,
  input: StandardCreateMessageInput,
): Promise<MessageEntity> => {
  await assertCanCreateMessage(db, user.id, input.roomId, input.message);
  const messageClient = await useTableClient(AzureTable.Messages);
  const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
  const now = new Date();
  const newMessageEntity = await createMessage(messageClient, messageAscendingClient, {
    ...input,
    userId: user.id,
  });
  await updateUserToRoom(db, user.id, {
    lastMessageAt: now,
    roomId: input.roomId,
  });
  messageEventEmitter.emit("createMessage", [[newMessageEntity], { sessionId: session.id }]);

  // Best-effort after the Table write — a failed increment loses one badge count, never a message.
  const mentionedUsersToRooms = await getResultAsync(() => incrementMentionCounts(db, newMessageEntity))
    .orTee(console.error)
    .unwrapOr([]);
  for (const mentionedUserToRoom of mentionedUsersToRooms)
    userToRoomEventEmitter.emit("updateUserToRoom", mentionedUserToRoom);

  const readPushSubscriptions = await getPushSubscriptionsForMessage(db, newMessageEntity);
  // Resolve the sender's room title once — shared by the generic message push and the thread-reply push, so
  // A reply never runs the same nickname lookup twice. Skip it entirely when no push path needs it.
  let title = user.name;
  if (readPushSubscriptions.length > 0 || newMessageEntity.replyRowKey) {
    const nickname = (
      await db.query.usersToRoomsInMessage.findFirst({
        columns: { nickname: true },
        where: {
          roomId: newMessageEntity.partitionKey,
          userId: user.id,
        },
      })
    )?.nickname;
    title = nickname || user.name;
  }
  const notificationOptions: NotificationOptions = { icon: user.image, title };

  if (readPushSubscriptions.length > 0) {
    const eventGridPublisherClient = useEventGridPublisherClient();
    const data: PushNotificationEventGridData = {
      message: {
        message: newMessageEntity.message,
        partitionKey: newMessageEntity.partitionKey,
        rowKey: newMessageEntity.rowKey,
        userId: newMessageEntity.userId,
      },
      notificationOptions,
    };
    // Best-effort after the Table write — a failed publish loses one push, never the message that already landed.
    await getResultAsync(() =>
      eventGridPublisherClient.send([
        createEventGridEvent(
          AzureFunction.ProcessPushNotification,
          `${newMessageEntity.partitionKey}/${newMessageEntity.rowKey}`,
          data,
        ),
      ]),
    ).match(() => undefined, console.error);
  }

  // A reply auto-follows its thread (Discord behaviour) and notifies existing followers. Both run post-persist
  // And best-effort — a follow/notify failure must never fail the reply that already landed. Anyone already
  // Reached by the generic message push above is excluded so a single reply never double-notifies a recipient.
  if (newMessageEntity.replyRowKey) {
    const threadRootRowKey = newMessageEntity.replyRowKey;
    await getResultAsync(() =>
      createThreadFollow(db, { roomId: newMessageEntity.partitionKey, threadRootRowKey, userId: user.id }),
    ).match(() => undefined, console.error);
    const excludedUserIds = [...new Set(readPushSubscriptions.map((pushSubscription) => pushSubscription.userId))];
    await getResultAsync(() =>
      notifyThreadReplyFollowers(db, newMessageEntity, notificationOptions, excludedUserIds),
    ).match(() => undefined, console.error);
  }

  const updatedRoom = requireMutation(
    (await db.update(roomsInMessage).set({ updatedAt: now }).where(eq(roomsInMessage.id, input.roomId)).returning())[0],
    Operation.Update,
    DatabaseEntityType.Room,
    input.roomId,
  );
  roomEventEmitter.emit("updateRoom", updatedRoom);
  return newMessageEntity;
};
