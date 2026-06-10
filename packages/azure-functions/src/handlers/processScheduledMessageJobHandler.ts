import type { StorageQueueHandler } from "@azure/functions";

import { assertCanCreateMessage } from "@/services/assertCanCreateMessage";
import { db } from "@/services/db";
import { getTableClient } from "@/services/getTableClient";
import { getWebPubSubServiceClient } from "@/services/getWebPubSubServiceClient";
import { sendPushNotification } from "@/services/sendPushNotification";
import { sendReminderNotification } from "@/services/sendReminderNotification";
import { createMessage } from "@esposter/db";
import {
  AzureFunction,
  AzureTable,
  AzureWebPubSubHub,
  MessageType,
  roomsInMessage,
  scheduledMessageJobPayloadSchema,
  scheduledMessageJobQueueMessageSchema,
  scheduledMessageJobsInMessage,
  ScheduledMessageJobType,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, eq, isNull } from "drizzle-orm";

export const processScheduledMessageJobHandler: StorageQueueHandler = (message, context) =>
  getResultAsync(async () => {
    const { id } = scheduledMessageJobQueueMessageSchema.parse(
      typeof message === "string" ? JSON.parse(message) : message,
    );
    const [job] = await db
      .update(scheduledMessageJobsInMessage)
      .set({ completedAt: new Date() })
      .where(
        and(
          eq(scheduledMessageJobsInMessage.id, id),
          isNull(scheduledMessageJobsInMessage.cancelledAt),
          isNull(scheduledMessageJobsInMessage.completedAt),
        ),
      )
      .returning();
    if (!job) return;

    const payload = scheduledMessageJobPayloadSchema.parse(job.payload);
    if (payload.type === ScheduledMessageJobType.Reminder)
      await sendReminderNotification(context, { roomId: job.roomId, text: payload.text, userId: job.userId });
    else {
      await assertCanCreateMessage(job.userId, job.roomId, payload.message);
      const messageClient = await getTableClient(AzureTable.Messages);
      const messageAscendingClient = await getTableClient(AzureTable.MessagesAscending);
      const newMessage = await createMessage(messageClient, messageAscendingClient, {
        message: payload.message,
        roomId: job.roomId,
        type: MessageType.Message,
        userId: job.userId,
      });
      const webPubSubServiceClient = getWebPubSubServiceClient(AzureWebPubSubHub.Messages);
      await webPubSubServiceClient.group(newMessage.partitionKey).sendToAll(newMessage);

      const userToRoom = await db.query.usersToRoomsInMessage.findFirst({
        columns: { nickname: true },
        where: { roomId: { eq: job.roomId }, userId: { eq: job.userId } },
        with: { user: { columns: { image: true, name: true } } },
      });
      if (userToRoom)
        await sendPushNotification(context, {
          message: {
            message: newMessage.message,
            partitionKey: newMessage.partitionKey,
            rowKey: newMessage.rowKey,
            userId: newMessage.userId,
          },
          notificationOptions: {
            icon: userToRoom.user.image,
            title: userToRoom.nickname || userToRoom.user.name,
          },
        });

      await Promise.all([
        db
          .update(usersToRoomsInMessage)
          .set({ lastMessageAt: new Date() })
          .where(and(eq(usersToRoomsInMessage.roomId, job.roomId), eq(usersToRoomsInMessage.userId, job.userId))),
        db.update(roomsInMessage).set({ updatedAt: new Date() }).where(eq(roomsInMessage.id, job.roomId)),
      ]);
    }
  }).match(noop, (error) => {
    context.error(`${AzureFunction.ProcessScheduledMessageJob} failed: `, error);
    throw error;
  });
