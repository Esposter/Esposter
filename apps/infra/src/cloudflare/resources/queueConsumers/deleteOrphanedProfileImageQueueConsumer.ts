import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { deleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/deleteOrphanedProfileImage";
import { deleteOrphanedProfileImageDeadLetterQueue } from "#src/cloudflare/resources/queues/deleteOrphanedProfileImageDeadLetterQueue";
import * as cloudflare from "@pulumi/cloudflare";

export const deleteOrphanedProfileImageQueueConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-delete-orphaned-profile-image",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: deleteOrphanedProfileImageDeadLetterQueue.queueName,
    queueId: deleteOrphanedProfileImage.queueId,
    scriptName: CloudflareWorkerName.esposterFunctions,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: deleteOrphanedProfileImage, protect: true },
);
