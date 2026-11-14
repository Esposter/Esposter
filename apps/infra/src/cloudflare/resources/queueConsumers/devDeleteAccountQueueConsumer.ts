import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devDeleteAccount } from "#src/cloudflare/resources/queues/devDeleteAccount";
import { devDeleteAccountDeadLetterQueue } from "#src/cloudflare/resources/queues/devDeleteAccountDeadLetterQueue";
import * as cloudflare from "@pulumi/cloudflare";

export const devDeleteAccountQueueConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-dev-delete-account",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devDeleteAccountDeadLetterQueue.queueName,
    queueId: devDeleteAccount.queueId,
    scriptName: CloudflareWorkerName.esposterFunctionsDev,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: devDeleteAccount, protect: true },
);
