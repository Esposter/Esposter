import type { StorageQueueHandler } from "@azure/functions";

import { assertCanCreateMessage } from "@/services/assertCanCreateMessage";
import { db } from "@/services/db";
import { getQueueClient } from "@/services/getQueueClient";
import { getTableClient } from "@/services/getTableClient";
import { getWebPubSubServiceClient } from "@/services/getWebPubSubServiceClient";
import { sendPushNotification } from "@/services/sendPushNotification";
import { sendReminderNotification } from "@/services/sendReminderNotification";
import { createMessage, enqueueScheduledMessageJob } from "@esposter/db";
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

export const processScheduledMessageJobHandler: StorageQueueHandler = (message, context) =>
  getResultAsync(async () => {
    const { id } = scheduledMessageJobQueueMessageSchema.parse(message);
    context.log(`${AzureFunction.ProcessScheduledMessageJob} dequeued job`, { id });
    const job = await db.query.scheduledMessageJobsInMessage.findFirst({
      where: { cancelledAt: { isNull: true }, completedAt: { isNull: true }, id: { eq: id } },
    });
    if (!job) {
      context.log(`${AzureFunction.ProcessScheduledMessageJob} skipped: no active job`, { id });
      return;
    } else if (job.runAt.getTime() > Date.now()) {
      context.log(`${AzureFunction.ProcessScheduledMessageJob} requeued: runAt in future`, {
        id,
        now: new Date().toISOString(),
        runAt: job.runAt.toISOString(),
      });
      await enqueueScheduledMessageJob(getQueueClient(AzureQueue.ScheduledMessageJobs), job.id, job.runAt);
      return;
    }

    const [processingJob] = await db
      .update(scheduledMessageJobsInMessage)
      .set({ processingStartedAt: new Date() })
      .where(
        and(
          eq(scheduledMessageJobsInMessage.id, id),
          isNull(scheduledMessageJobsInMessage.cancelledAt),
          isNull(scheduledMessageJobsInMessage.completedAt),
        ),
      )
      .returning();
    if (!processingJob) {
      context.log(`${AzureFunction.ProcessScheduledMessageJob} skipped: lost processing race`, { id });
      return;
    }

    const payload = scheduledMessageJobPayloadSchema.parse(processingJob.payload);
    if (payload.type === ScheduledMessageJobType.Reminder)
      await sendReminderNotification(context, {
        roomId: processingJob.roomId,
        text: payload.text,
        userId: processingJob.userId,
      });
    else {
      await assertCanCreateMessage(processingJob.userId, processingJob.roomId, payload.message);
      const messageClient = await getTableClient(AzureTable.Messages);
      const messageAscendingClient = await getTableClient(AzureTable.MessagesAscending);
      const newMessage = await createMessage(messageClient, messageAscendingClient, {
        message: payload.message,
        roomId: processingJob.roomId,
        type: MessageType.Message,
        userId: processingJob.userId,
      });
      context.log(`${AzureFunction.ProcessScheduledMessageJob} created message`, {
        partitionKey: newMessage.partitionKey,
        rowKey: newMessage.rowKey,
      });
      const webPubSubServiceClient = getWebPubSubServiceClient(AzureWebPubSubHub.Messages);
      await webPubSubServiceClient.group(newMessage.partitionKey).sendToAll(newMessage);

      const userToRoom = await db.query.usersToRoomsInMessage.findFirst({
        columns: { nickname: true },
        where: { roomId: { eq: processingJob.roomId }, userId: { eq: processingJob.userId } },
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
          .where(
            and(
              eq(usersToRoomsInMessage.roomId, processingJob.roomId),
              eq(usersToRoomsInMessage.userId, processingJob.userId),
            ),
          ),
        db.update(roomsInMessage).set({ updatedAt: new Date() }).where(eq(roomsInMessage.id, processingJob.roomId)),
      ]);
    }

    await db
      .update(scheduledMessageJobsInMessage)
      .set({ completedAt: new Date() })
      .where(eq(scheduledMessageJobsInMessage.id, processingJob.id));
  }).match(noop, (error) => {
    context.error(`${AzureFunction.ProcessScheduledMessageJob} failed: `, error);
    throw error;
  });
