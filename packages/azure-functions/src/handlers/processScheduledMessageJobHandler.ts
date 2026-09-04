import type { ServiceBusQueueHandler } from "@azure/functions";

import { assertCanCreateMessage } from "#src/services/assertCanCreateMessage";
import { createAndBroadcastMessage } from "#src/services/createAndBroadcastMessage";
import { db } from "#src/services/db";
import { eventGridPublisherClient } from "#src/services/eventGridPublisherClient";
import { getServiceBusSender } from "#src/services/getServiceBusSender";
import { getTableClient } from "#src/services/getTableClient";
import { logAndRethrow } from "#src/services/logAndRethrow";
import { createReplyThreadFollows, enqueueScheduledMessageJob } from "@esposter/db";
import {
  AppNotificationType,
  AzureFunction,
  AzureQueue,
  AzureTable,
  MessageType,
  publishNotification,
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
    // Every write below this one targets the job this invocation dequeued, so the row it addresses is stated once
    const updateJob = (values: Partial<typeof scheduledMessageJobsInMessage.$inferInsert>) =>
      db.update(scheduledMessageJobsInMessage).set(values).where(eq(scheduledMessageJobsInMessage.id, id));
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
    // (AzureFunctionIsIdempotentMap): delivery is at-least-once, and a message carries a fresh reverse-ticked
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
        assertCanCreateMessage(context, processingJob.userId, processingJob.roomId, payload.message),
      ).match(
        () => false,
        async (error) => {
          if (error instanceof WordFilteredError) return true;

          await updateJob({ processingStartedAt: null });
          throw error;
        },
      );
      // A word-filter block is the one guard a redelivery can never clear, and it has already applied the room's
      // Automod action — so the job is tombstoned rather than retried, which would re-apply that action per delivery
      if (isWordFiltered) {
        await updateJob({ cancelledAt: new Date() });
        context.log(`${AzureFunction.ProcessScheduledMessageJob} cancelled: message is word filtered`, { id });
        return;
      }
    }

    if (payload.type === ScheduledMessageJobType.Reminder)
      // Best-effort for the same reason as the message branch below: the claim is single-shot, so a rethrow asks
      // For a redelivery that is skipped and leaves the job holding a claim it can never release. The delivery
      // Itself is no longer what is at risk — it is published now, so a failure past this point is Event Grid's
      // To retry and dead-letter ([dead-letter replay](/docs/infra/eventgrid-dead-letter))
      await getResultAsync(() =>
        publishNotification(eventGridPublisherClient, {
          roomId: processingJob.roomId,
          text: payload.text,
          type: AppNotificationType.Reminder,
          userId: processingJob.userId,
        }),
      ).match(noop, (error) => {
        context.error(`${AzureFunction.ProcessScheduledMessageJob} failed to notify`, { error, id });
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
        // A message scheduled from a thread lands back in that thread, exactly as sending it there would
        replyRowKey: payload.replyRowKey,
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
      // For is skipped — it would only leave the job stuck mid-delivery with `completedAt` never stamped.
      // One Result each, exactly as `createUserMessage` does: sharing one closure makes every step after the
      // First failure conditional on it, so a follow that could not be written would silently cost the
      // Notification and the room's sort order too
      const logFailure = (step: string) => (error: unknown) => {
        context.error(`${AzureFunction.ProcessScheduledMessageJob} failed to ${step}`, { error, id });
      };
      // A message scheduled into a thread is a reply like any other, so it owes the same follow rows — and
      // Owes them before the publish that reads them
      await getResultAsync(async () =>
        createReplyThreadFollows(db, await getTableClient(AzureTable.Messages), newMessage),
      ).match(noop, logFailure("follow the thread"));
      await getResultAsync(() =>
        publishNotification(eventGridPublisherClient, {
          message: {
            message: newMessage.message,
            partitionKey: newMessage.partitionKey,
            rowKey: newMessage.rowKey,
            userId: newMessage.userId,
          },
          // A message scheduled into a thread notifies that thread's followers, exactly as sending it there would
          threadRootRowKey: payload.replyRowKey,
          type: AppNotificationType.Message,
        }),
      ).match(noop, logFailure("notify"));
      // A room-list sort order, not a guard input — so unlike the slowmode clock above this one stays here,
      // Where a failure leaves the room list one send behind until the next one lands
      await getResultAsync(() =>
        db.update(roomsInMessage).set({ updatedAt: new Date() }).where(eq(roomsInMessage.id, processingJob.roomId)),
      ).match(noop, logFailure("touch the room"));
    }

    await updateJob({ completedAt: new Date() });
  }).match(noop, logAndRethrow(context, AzureFunction.ProcessScheduledMessageJob));
