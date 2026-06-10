import { db } from "@/services/db";
import { getTableClient } from "@/services/getTableClient";
import { getWebPubSubServiceClient } from "@/services/getWebPubSubServiceClient";
import { assertCanCreateMessage } from "@/services/message/assertCanCreateMessage";
import { sendReminderNotification } from "@/services/message/sendReminderNotification";
import { pushNotification } from "@/services/pushNotification";
import { app } from "@azure/functions";
import { createMessage } from "@esposter/db";
import {
  AzureFunction,
  AzureQueue,
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

app.storageQueue(AzureFunction.ProcessScheduledMessageJob, {
  connection: "AZURE_STORAGE_ACCOUNT_CONNECTION_STRING",
  handler: (message, context) =>
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
      if (payload.type === ScheduledMessageJobType.Reminder) {
        await sendReminderNotification(context, { roomId: job.roomId, text: payload.text, userId: job.userId });
      } else {
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
          where: { roomId: job.roomId, userId: job.userId },
          with: { user: { columns: { image: true, name: true } } },
        });
        if (userToRoom)
          await pushNotification(context, {
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
    }),
  queueName: AzureQueue.ScheduledMessageJobs,
});

export default {};
