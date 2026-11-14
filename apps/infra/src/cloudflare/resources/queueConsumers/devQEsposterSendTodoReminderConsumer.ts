import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devDlqEsposterSendTodoReminder } from "#src/cloudflare/resources/queues/devDlqEsposterSendTodoReminder";
import { devQEsposterSendTodoReminder } from "#src/cloudflare/resources/queues/devQEsposterSendTodoReminder";
import * as cloudflare from "@pulumi/cloudflare";

export const devQEsposterSendTodoReminderConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-dev-send-todo-reminder",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devDlqEsposterSendTodoReminder.queueName,
    queueId: devQEsposterSendTodoReminder.queueId,
    scriptName: CloudflareWorkerName.esposterFunctionsDev,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: devQEsposterSendTodoReminder, protect: true },
);
