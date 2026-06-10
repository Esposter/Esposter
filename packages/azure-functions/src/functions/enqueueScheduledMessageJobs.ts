import { getQueueClient } from "@/services/getQueueClient";
import { db } from "@/services/db";
import { app } from "@azure/functions";
import {
  AzureFunction,
  AzureQueue,
  scheduledMessageJobQueueMessageSchema,
  scheduledMessageJobsInMessage,
} from "@esposter/db-schema";
import { getResultAsync, MAX_READ_LIMIT, noop } from "@esposter/shared";
import { and, isNull, lte, or, lt } from "drizzle-orm";

const PROCESSING_TIMEOUT_MS = 10 * 60 * 1000;

app.timer(AzureFunction.EnqueueScheduledMessageJobs, {
  handler: (_timer, context) => {
    return getResultAsync(async () => {
      const now = new Date();
      const staleProcessingStartedAt = new Date(now.getTime() - PROCESSING_TIMEOUT_MS);
      const jobs = await db
        .select({ id: scheduledMessageJobsInMessage.id })
        .from(scheduledMessageJobsInMessage)
        .where(
          and(
            lte(scheduledMessageJobsInMessage.runAt, now),
            isNull(scheduledMessageJobsInMessage.cancelledAt),
            isNull(scheduledMessageJobsInMessage.completedAt),
            or(
              isNull(scheduledMessageJobsInMessage.processingStartedAt),
              lt(scheduledMessageJobsInMessage.processingStartedAt, staleProcessingStartedAt),
            ),
          ),
        )
        .limit(MAX_READ_LIMIT);
      const queueClient = getQueueClient(AzureQueue.ScheduledMessageJobs);
      await queueClient.createIfNotExists();
      await Promise.all(
        jobs.map(({ id }) =>
          queueClient.sendMessage(JSON.stringify(scheduledMessageJobQueueMessageSchema.parse({ id }))),
        ),
      );
      context.log(`Enqueued ${jobs.length} scheduled message jobs.`);
    }).match(noop, (error) => {
      context.error(`${AzureFunction.EnqueueScheduledMessageJobs} failed: `, error);
      throw error;
    });
  },
  schedule: "0 * * * * *",
});

export default {};
