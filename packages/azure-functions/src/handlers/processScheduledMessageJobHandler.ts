import type { ServiceBusQueueHandler } from "@azure/functions";

import { assertCanCreateMessage } from "@/services/assertCanCreateMessage";
import { createAndBroadcastMessage } from "@/services/createAndBroadcastMessage";
import { db } from "@/services/db";
import { getPushNotificationData } from "@/services/getPushNotificationData";
import { getServiceBusSender } from "@/services/getServiceBusSender";
import { logAndRethrow } from "@/services/logAndRethrow";
import { sendPushNotification } from "@/services/sendPushNotification";
import { sendReminderNotification } from "@/services/sendReminderNotification";
import { enqueueScheduledMessageJob } from "@esposter/db";
import {
  AzureFunction,
  AzureQueue,
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

export const processScheduledMessageJobHandler: ServiceBusQueueHandler = (message, context) =>
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
      await enqueueScheduledMessageJob(getServiceBusSender(AzureQueue.ScheduledMessageJobs), job.id, job.runAt);
      return;
    }

    const payload = scheduledMessageJobPayloadSchema.parse(job.payload);
    // Every delivery-time guard runs before the claim, mirroring `sendScheduledMessageNow`: the claim below is
    // Single-shot, so a rejection — non-member, read-only, slowmode, timeout, word filter — after it would burn
    // The job (the redelivery a rethrow asks for is skipped). Thrown here the job is still unclaimed, so Service
    // Bus redelivers and retries, and a job whose retries exhaust stays visible to cancel/reschedule/send-now
    if (payload.type === ScheduledMessageJobType.ScheduledMessage)
      await assertCanCreateMessage(job.userId, job.roomId, payload.message);

    // Claiming on `processingStartedAt IS NULL` is what makes this handler idempotent
    // (IsIdempotentAzureFunctionMap): delivery is at-least-once, and a message carries a fresh reverse-ticked
    // RowKey, so a redelivery that could re-pass this guard would post a second copy rather than repair the first
    const [processingJob] = await db
      .update(scheduledMessageJobsInMessage)
      .set({ processingStartedAt: new Date() })
      .where(
        and(
          eq(scheduledMessageJobsInMessage.id, id),
          isNull(scheduledMessageJobsInMessage.cancelledAt),
          isNull(scheduledMessageJobsInMessage.completedAt),
          isNull(scheduledMessageJobsInMessage.processingStartedAt),
        ),
      )
      .returning();
    if (!processingJob) {
      context.log(`${AzureFunction.ProcessScheduledMessageJob} skipped: lost processing race`, { id });
      return;
    }

    if (payload.type === ScheduledMessageJobType.Reminder)
      await sendReminderNotification(context, {
        roomId: processingJob.roomId,
        text: payload.text,
        userId: processingJob.userId,
      });
    else {
      const newMessage = await createAndBroadcastMessage(context, {
        message: payload.message,
        roomId: processingJob.roomId,
        type: MessageType.Message,
        userId: processingJob.userId,
      });
      context.log(`${AzureFunction.ProcessScheduledMessageJob} created message`, {
        partitionKey: newMessage.partitionKey,
        rowKey: newMessage.rowKey,
      });

      // Best-effort after the message write ([persist then notify](/docs/architecture/persist-then-notify)). A
      // Rethrow here cannot retry these steps anyway — the claim above is single-shot, so the redelivery it asks
      // For is skipped — it would only leave the job stuck mid-delivery with `completedAt` never stamped
      await getResultAsync(async () => {
        const userToRoom = await db.query.usersToRoomsInMessage.findFirst({
          columns: { nickname: true },
          where: { roomId: { eq: processingJob.roomId }, userId: { eq: processingJob.userId } },
          with: { user: { columns: { image: true, name: true } } },
        });
        if (userToRoom)
          await sendPushNotification(
            context,
            getPushNotificationData(newMessage, {
              icon: userToRoom.user.image,
              title: userToRoom.nickname || userToRoom.user.name,
            }),
          );

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
      }).match(noop, (error) => {
        context.error(`${AzureFunction.ProcessScheduledMessageJob} failed to notify`, { error, id });
      });
    }

    await db
      .update(scheduledMessageJobsInMessage)
      .set({ completedAt: new Date() })
      .where(eq(scheduledMessageJobsInMessage.id, processingJob.id));
  }).match(noop, logAndRethrow(context, AzureFunction.ProcessScheduledMessageJob));
