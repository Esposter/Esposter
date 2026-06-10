import { getTableClient } from "@/services/getTableClient";
import { getWebPubSubServiceClient } from "@/services/getWebPubSubServiceClient";
import { assertCanCreateMessage } from "@/services/message/assertCanCreateMessage";
import { sendReminderNotification } from "@/services/message/sendReminderNotification";
import { pushNotification } from "@/services/pushNotification";
import { db } from "@/services/db";
import { app } from "@azure/functions";
import { createMessage } from "@esposter/db";
import {
  AzureFunction,
  AzureQueue,
  AzureTable,
  AzureWebPubSubHub,
  MessageType,
  reminderScheduledMessageJobPayloadSchema,
  roomsInMessage,
  scheduledMessageJobQueueMessageSchema,
  scheduledMessageJobsInMessage,
  scheduledMessageScheduledMessageJobPayloadSchema,
  ScheduledMessageJobType,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, eq, isNull, lte, or, lt } from "drizzle-orm";

const PROCESSING_TIMEOUT_MS = 10 * 60 * 1000;

app.storageQueue(AzureFunction.ProcessScheduledMessageJob, {
  connection: "AZURE_STORAGE_ACCOUNT_CONNECTION_STRING",
  handler: (message, context) => {
    return getResultAsync(async () => {
      const { id } = scheduledMessageJobQueueMessageSchema.parse(
        typeof message === "string" ? JSON.parse(message) : message,
      );
      const now = new Date();
      const staleProcessingStartedAt = new Date(now.getTime() - PROCESSING_TIMEOUT_MS);
      const [job] = await db
        .update(scheduledMessageJobsInMessage)
        .set({ processingStartedAt: now })
        .where(
          and(
            eq(scheduledMessageJobsInMessage.id, id),
            lte(scheduledMessageJobsInMessage.runAt, now),
            isNull(scheduledMessageJobsInMessage.cancelledAt),
            isNull(scheduledMessageJobsInMessage.completedAt),
            or(
              isNull(scheduledMessageJobsInMessage.processingStartedAt),
              lt(scheduledMessageJobsInMessage.processingStartedAt, staleProcessingStartedAt),
            ),
          ),
        )
        .returning();
      if (!job) return;

      try {
        if (job.type === ScheduledMessageJobType.Reminder) {
          const payload = reminderScheduledMessageJobPayloadSchema.parse(job.payload);
          await sendReminderNotification(context, { roomId: job.roomId, text: payload.text, userId: job.userId });
        } else {
          const payload = scheduledMessageScheduledMessageJobPayloadSchema.parse(job.payload);
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

        await db
          .update(scheduledMessageJobsInMessage)
          .set({ completedAt: new Date() })
          .where(eq(scheduledMessageJobsInMessage.id, job.id));
      } catch (error) {
        await db
          .update(scheduledMessageJobsInMessage)
          .set({ processingStartedAt: null })
          .where(eq(scheduledMessageJobsInMessage.id, job.id));
        throw error;
      }
    }).match(noop, (error) => {
      context.error(`${AzureFunction.ProcessScheduledMessageJob} failed: `, error);
      throw error;
    });
  },
  queueName: AzureQueue.ScheduledMessageJobs,
});

export default {};
