import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { devDlqEsposterSendTodoReminder } from "#src/cloudflare/resources/queues/devDlqEsposterSendTodoReminder";
import { devQEsposterSendTodoReminder } from "#src/cloudflare/resources/queues/devQEsposterSendTodoReminder";
import {
  CloudflareAssetType,
  CloudflareEnvironment,
  CloudflareWorkerPurpose,
  getCloudflareResourceName,
  QueueJob,
  QueueJobMaxRetriesMap,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const queueName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Queue,
  QueueJob.SendTodoReminder,
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
    settings: { maxRetries: QueueJobMaxRetriesMap[QueueJob.SendTodoReminder], retryDelay: QueueConsumerRetryDelay },
    type: "worker",
  },
  { parent: devQEsposterSendTodoReminder, protect: true },
);
