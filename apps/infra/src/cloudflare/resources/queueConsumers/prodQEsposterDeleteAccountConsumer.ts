import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { prodDlqEsposterDeleteAccount } from "#src/cloudflare/resources/queues/prodDlqEsposterDeleteAccount";
import { prodQEsposterDeleteAccount } from "#src/cloudflare/resources/queues/prodQEsposterDeleteAccount";
import * as cloudflare from "@pulumi/cloudflare";

export const prodQEsposterDeleteAccountConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-delete-account",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: prodDlqEsposterDeleteAccount.queueName,
    queueId: prodQEsposterDeleteAccount.queueId,
    scriptName: CloudflareWorkerName.esposterFunctions,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: prodQEsposterDeleteAccount, protect: true },
);
