import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devDlqEsposterSendTodoReminder } from "#src/cloudflare/resources/queues/devDlqEsposterSendTodoReminder";
import { devQEsposterSendTodoReminder } from "#src/cloudflare/resources/queues/devQEsposterSendTodoReminder";
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
  CloudflareEnvironment.Development,
  CloudflareAssetType.Queue,
  toKebabCase(AzureFunction.SendTodoReminder),
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const devQEsposterSendTodoReminderConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devDlqEsposterSendTodoReminder.queueName,
    queueId: devQEsposterSendTodoReminder.queueId,
    scriptName,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: devQEsposterSendTodoReminder, protect: true },
);
