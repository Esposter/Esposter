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
import { getResultAsync, noop, WordFilteredError } from "@esposter/shared";
import { and, eq, isNull } from "drizzle-orm";

export const processScheduledMessageJobHandler: ServiceBusQueueHandler = (message, context) =>
  getResultAsync(async () => {
    const { id } = scheduledMessageJobQueueMessageSchema.parse(message);
    context.log(`${AzureFunction.ProcessScheduledMessageJob} dequeued job`, { id });
    // Every column the claim below requires to be unset must be unset here too: this read settles an
    // Already-cancelled/completed/claimed job without paying for the claim's write. The claim stays
    // Authoritative — it is what actually stops a redelivery re-running the guards and the send.
    const job = await db.query.scheduledMessageJobsInMessage.findFirst({
      where: {
        cancelledAt: { isNull: true },
        completedAt: { isNull: true },
        id: { eq: id },
        processingStartedAt: { isNull: true },
      },
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

    // Parsed BEFORE the claim, and it is the last thing that may fail before it: a payload the current schema
    // Rejects (a shape an older deploy wrote, column drift) throws here while the row is still untouched, so the
    // Redelivery finds it claimable. Parsed after the claim, that same throw strands the job — the claim is
    // Single-shot, so every redelivery loses the race, and the row is left neither deliverable nor cancellable
    const payload = scheduledMessageJobPayloadSchema.parse(job.payload);
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
    // Everything past the claim reads the claimed row, never the pre-claim read above: the two are the same row, and
    // Mixing them reads as though the distinction were load-bearing. `payload` is the exception, and deliberately —
    // It has to be parsed before the claim exists to strand
    if (payload.type === ScheduledMessageJobType.ScheduledMessage) {
      // The delivery-time guards run INSIDE the claim, unlike `sendScheduledMessageNow`'s request path, because
      // One of them has side effects: a word-filter block times the user out and writes an AutoMod audit row,
      // And the tombstone that records it is a second write. Guarded outside the claim, a failure between those
      // Two writes leaves the job unclaimed and uncancelled, so the redelivery re-runs the filter and punishes
      // The user a second time for one message — two timeouts and two audit rows.
      // Every other rejection (non-member, read-only, slowmode, timeout) has no side effect and can clear on its
      // Own, so the claim is released before the rethrow asks Service Bus to redeliver — the claim is
      // Single-shot, and a job left holding it would be neither delivered nor cancellable/reschedulable
      const isWordFiltered = await getResultAsync(() =>
        assertCanCreateMessage(processingJob.userId, processingJob.roomId, payload.message),
      ).match(
        () => false,
        async (error) => {
          if (error instanceof WordFilteredError) return true;

          await db
            .update(scheduledMessageJobsInMessage)
            .set({ processingStartedAt: null })
            .where(eq(scheduledMessageJobsInMessage.id, id));
          throw error;
        },
      );
      // A word-filter block is the one guard a redelivery can never clear, and it has already applied the room's
      // Automod action — so the job is tombstoned rather than retried, which would re-apply that action per delivery
      if (isWordFiltered) {
        await db
          .update(scheduledMessageJobsInMessage)
          .set({ cancelledAt: new Date() })
          .where(eq(scheduledMessageJobsInMessage.id, id));
        context.log(`${AzureFunction.ProcessScheduledMessageJob} cancelled: message is word filtered`, { id });
        return;
      }
    }

    if (payload.type === ScheduledMessageJobType.Reminder)
      await sendReminderNotification(context, {
        roomId: processingJob.roomId,
        text: payload.text,
        userId: processingJob.userId,
      });
    else {
      // The slowmode clock is what the NEXT send is checked against, so it advances with the guards rather than
      // After the write, exactly as `createUserMessage` does: behind the write it would sit in the best-effort
      // Block below, where a failed push swallows it and leaves a stale `lastMessageAt` that keeps passing —
      // Slowmode silently stops applying. Advancing first can only cost one window on a write that throws
      await db
        .update(usersToRoomsInMessage)
        .set({ lastMessageAt: new Date() })
        .where(
          and(
            eq(usersToRoomsInMessage.roomId, processingJob.roomId),
            eq(usersToRoomsInMessage.userId, processingJob.userId),
          ),
        );
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

        // A room-list sort order, not a guard input — so unlike the slowmode clock above this one stays here,
        // Where a failure leaves the room list one send behind until the next one lands
        await db
          .update(roomsInMessage)
          .set({ updatedAt: new Date() })
          .where(eq(roomsInMessage.id, processingJob.roomId));
      }).match(noop, (error) => {
        context.error(`${AzureFunction.ProcessScheduledMessageJob} failed to notify`, { error, id });
      });
    }

    await db
      .update(scheduledMessageJobsInMessage)
      .set({ completedAt: new Date() })
      .where(eq(scheduledMessageJobsInMessage.id, processingJob.id));
  }).match(noop, logAndRethrow(context, AzureFunction.ProcessScheduledMessageJob));
