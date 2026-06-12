import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";
import type { MessageEntity, PushNotificationEventGridData, StandardCreateMessageInput } from "@esposter/db-schema";

import { useEventGridPublisherClient } from "@@/server/composables/azure/eventGrid/useEventGridPublisherClient";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { roomEventEmitter } from "@@/server/services/message/events/roomEventEmitter";
import { assertCanCreateMessage } from "@@/server/services/message/moderation/assertCanCreateMessage";
import { updateUserToRoom } from "@@/server/services/message/updateUserToRoom";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { createMessage, getPushSubscriptionsForMessage } from "@esposter/db";
import { AzureFunction, AzureTable, DatabaseEntityType, roomsInMessage } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
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

  const readPushSubscriptions = await getPushSubscriptionsForMessage(db, newMessageEntity);
  if (readPushSubscriptions.length > 0) {
    const eventGridPublisherClient = useEventGridPublisherClient();
    const nickname = (
      await db.query.usersToRoomsInMessage.findFirst({
        columns: { nickname: true },
        where: {
          roomId: newMessageEntity.partitionKey,
          userId: user.id,
        },
      })
    )?.nickname;
    const data: PushNotificationEventGridData = {
      message: {
        message: newMessageEntity.message,
        partitionKey: newMessageEntity.partitionKey,
        rowKey: newMessageEntity.rowKey,
        userId: newMessageEntity.userId,
      },
      notificationOptions: {
        icon: user.image,
        title: nickname || user.name,
      },
    };
    await eventGridPublisherClient.send([
      {
        data,
        dataVersion: "1.0",
        eventType: AzureFunction.ProcessPushNotification,
        subject: `${newMessageEntity.partitionKey}/${newMessageEntity.rowKey}`,
      },
    ]);
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
