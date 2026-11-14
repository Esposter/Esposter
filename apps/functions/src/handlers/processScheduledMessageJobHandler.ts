import { getJobQueue } from "#src/services/queue/getJobQueue";
import { getScheduler } from "#src/services/scheduler/getScheduler";
import { db } from "#src/services/shared/db";
import {
  AppNotificationType,
  QueueJob,
  publishNotification,
  scheduledMessageJobPayloadSchema,
  scheduledMessageJobQueueMessageSchema,
  scheduledMessageJobsInMessage,
  ScheduledMessageJobType,
} from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, eq, isNull } from "drizzle-orm";

// This queue delivers a TodoList reminder. A scheduled chat message is sent by its room's object when it comes due, so a
// job of that kind is never claimed here
export const processScheduledMessageJobHandler = async (message: unknown): Promise<void> => {
  const { id } = scheduledMessageJobQueueMessageSchema.parse(message);
  // Every write below this one targets the job this invocation dequeued, so the row it addresses is stated once
  const updateJob = (values: Partial<typeof scheduledMessageJobsInMessage.$inferInsert>) =>
    db.update(scheduledMessageJobsInMessage).set(values).where(eq(scheduledMessageJobsInMessage.id, id));
  console.log(`${QueueJob.ProcessScheduledMessageJob} dequeued job`, { id });
  // Every column the claim below requires to be unset must be unset here too: this read settles an
  // Already-cancelled/completed/claimed job without paying for the claim's write. The claim stays
  // Authoritative — it is what actually stops a redelivery re-running the send.
  const job = await db.query.scheduledMessageJobsInMessage.findFirst({
    where: {
      cancelledAt: { isNull: true },
      completedAt: { isNull: true },
      id: { eq: id },
      processingStartedAt: { isNull: true },
    },
  });
  if (!job) {
    console.log(`${QueueJob.ProcessScheduledMessageJob} skipped: no active job`, { id });
    return;
  } else if (job.runAt.getTime() > Date.now()) {
    console.log(`${QueueJob.ProcessScheduledMessageJob} requeued: runAt in future`, {
      id,
      now: new Date().toISOString(),
      runAt: job.runAt.toISOString(),
    });
    await getScheduler(job.id).schedule(job.runAt.getTime(), {
      payload: { id: job.id },
      queueJob: QueueJob.ProcessScheduledMessageJob,
    });
    return;
  }
  // Parsed BEFORE the claim, and it is the last thing that may fail before it: a payload the current schema
  // Rejects (column drift, or a shape it no longer takes) throws here while the row is still untouched, so the
  // Redelivery finds it claimable. Parsed after the claim, that same throw strands the job — the claim is
  // Single-shot, so every redelivery loses the race, and the row is left neither deliverable nor cancellable
  const payload = scheduledMessageJobPayloadSchema.parse(job.payload);
  // A chat message's job is left untouched, unclaimed, for the table's owner to retire: nothing here sends it
  if (payload.type !== ScheduledMessageJobType.Reminder) {
    console.log(`${QueueJob.ProcessScheduledMessageJob} skipped: not a reminder`, { id });
    return;
  }
  // Claiming on `processingStartedAt IS NULL` is what makes this handler idempotent
  // (QueueJobIsIdempotentMap): delivery is at-least-once, so a redelivery that could re-pass this guard would
  // Notify twice rather than repair the first
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
    console.log(`${QueueJob.ProcessScheduledMessageJob} skipped: lost processing race`, { id });
    return;
  }
  // Best-effort: the claim is single-shot, so a rethrow asks for a redelivery that is skipped and leaves the job
  // Holding a claim it can never release. The delivery itself is no longer what is at risk — it is published now, so a
  // Failure past this point is Event Grid's to retry and dead-letter ([dead-letter replay](openspec/specs/infra/eventgrid-dead-letter/design.md))
  await getResultAsync(() =>
    publishNotification(getJobQueue(QueueJob.ProcessNotification), {
      roomId: processingJob.roomId,
      text: payload.text,
      type: AppNotificationType.Reminder,
      userId: processingJob.userId,
    }),
  ).match(noop, (error) => {
    console.error(`${QueueJob.ProcessScheduledMessageJob} failed to notify`, { error, id });
  });

  await updateJob({ completedAt: new Date() });
};
