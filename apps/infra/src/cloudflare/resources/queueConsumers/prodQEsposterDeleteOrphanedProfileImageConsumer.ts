import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { prodDlqEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/prodDlqEsposterDeleteOrphanedProfileImage";
import { prodQEsposterDeleteOrphanedProfileImage } from "#src/cloudflare/resources/queues/prodQEsposterDeleteOrphanedProfileImage";
import * as cloudflare from "@pulumi/cloudflare";

export const prodQEsposterDeleteOrphanedProfileImageConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-delete-orphaned-profile-image",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: prodDlqEsposterDeleteOrphanedProfileImage.queueName,
    queueId: prodQEsposterDeleteOrphanedProfileImage.queueId,
    scriptName: CloudflareWorkerName.esposterFunctions,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: prodQEsposterDeleteOrphanedProfileImage, protect: true },
);
