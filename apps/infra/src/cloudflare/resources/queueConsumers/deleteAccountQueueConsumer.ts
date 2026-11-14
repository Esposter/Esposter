import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { deleteAccount } from "#src/cloudflare/resources/queues/deleteAccount";
import { deleteAccountDeadLetterQueue } from "#src/cloudflare/resources/queues/deleteAccountDeadLetterQueue";
import * as cloudflare from "@pulumi/cloudflare";

export const deleteAccountQueueConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-delete-account",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: deleteAccountDeadLetterQueue.queueName,
    queueId: deleteAccount.queueId,
    scriptName: CloudflareWorkerName.esposterFunctions,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: deleteAccount, protect: true },
);
