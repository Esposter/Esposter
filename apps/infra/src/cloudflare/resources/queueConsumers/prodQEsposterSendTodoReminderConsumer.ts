import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { prodDlqEsposterSendTodoReminder } from "#src/cloudflare/resources/queues/prodDlqEsposterSendTodoReminder";
import { prodQEsposterSendTodoReminder } from "#src/cloudflare/resources/queues/prodQEsposterSendTodoReminder";
import {
  AzureFunction,
  CloudflareAssetType,
  CloudflareEnvironment,
  CloudflareWorkerPurpose,
  getCloudflareResourceName,
} from "@esposter/db-schema";
import { toKebabCase } from "@esposter/shared";
import * as cloudflare from "@pulumi/cloudflare";

const queueName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Queue,
  toKebabCase(AzureFunction.SendTodoReminder),
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const prodQEsposterSendTodoReminderConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: prodDlqEsposterSendTodoReminder.queueName,
    queueId: prodQEsposterSendTodoReminder.queueId,
    scriptName,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: prodQEsposterSendTodoReminder, protect: true },
);
