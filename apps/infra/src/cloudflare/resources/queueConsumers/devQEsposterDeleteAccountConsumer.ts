import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devDlqEsposterDeleteAccount } from "#src/cloudflare/resources/queues/devDlqEsposterDeleteAccount";
import { devQEsposterDeleteAccount } from "#src/cloudflare/resources/queues/devQEsposterDeleteAccount";
import * as cloudflare from "@pulumi/cloudflare";

export const devQEsposterDeleteAccountConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-dev-delete-account",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devDlqEsposterDeleteAccount.queueName,
    queueId: devQEsposterDeleteAccount.queueId,
    scriptName: CloudflareWorkerName.esposterFunctionsDev,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: devQEsposterDeleteAccount, protect: true },
);
