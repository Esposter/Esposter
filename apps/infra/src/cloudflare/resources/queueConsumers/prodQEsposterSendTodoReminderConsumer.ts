import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { prodDlqEsposterSendTodoReminder } from "#src/cloudflare/resources/queues/prodDlqEsposterSendTodoReminder";
import { prodQEsposterSendTodoReminder } from "#src/cloudflare/resources/queues/prodQEsposterSendTodoReminder";
import * as cloudflare from "@pulumi/cloudflare";

export const prodQEsposterSendTodoReminderConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-send-todo-reminder",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: prodDlqEsposterSendTodoReminder.queueName,
    queueId: prodQEsposterSendTodoReminder.queueId,
    scriptName: CloudflareWorkerName.esposterFunctions,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: prodQEsposterSendTodoReminder, protect: true },
);
