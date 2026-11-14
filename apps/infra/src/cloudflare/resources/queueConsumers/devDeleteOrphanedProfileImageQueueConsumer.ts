import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/devDeleteOrphanedProfileImage";
import { devDeleteOrphanedProfileImageDeadLetterQueue } from "#src/cloudflare/resources/queues/devDeleteOrphanedProfileImageDeadLetterQueue";
import * as cloudflare from "@pulumi/cloudflare";

export const devDeleteOrphanedProfileImageQueueConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-dev-delete-orphaned-profile-image",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devDeleteOrphanedProfileImageDeadLetterQueue.queueName,
    queueId: devDeleteOrphanedProfileImage.queueId,
    scriptName: CloudflareWorkerName.esposterFunctionsDev,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: devDeleteOrphanedProfileImage, protect: true },
);
