import type { QueueClient } from "@azure/storage-queue";

import { MAX_QUEUE_VISIBILITY_TIMEOUT_SECONDS } from "@/services/azure/queue/constants";
import { dayjs } from "@/services/dayjs";
import { scheduledMessageJobQueueMessageSchema } from "@esposter/db-schema";

export const enqueueScheduledMessageJob = async (queueClient: QueueClient, id: string, runAt: Date) => {
  const visibilityTimeout = Math.min(
    Math.max(0, Math.ceil(dayjs.duration(runAt.getTime() - Date.now()).asSeconds())),
    MAX_QUEUE_VISIBILITY_TIMEOUT_SECONDS,
  );
  await queueClient.sendMessage(JSON.stringify(scheduledMessageJobQueueMessageSchema.parse({ id })), {
    visibilityTimeout,
  });
};
