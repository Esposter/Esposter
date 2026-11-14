import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { devSendTodoReminder } from "#src/cloudflare/resources/queues/devSendTodoReminder";
import { devSendTodoReminderDeadLetterQueue } from "#src/cloudflare/resources/queues/devSendTodoReminderDeadLetterQueue";
import * as cloudflare from "@pulumi/cloudflare";

export const devSendTodoReminderQueueConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-dev-send-todo-reminder",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: devSendTodoReminderDeadLetterQueue.queueName,
    queueId: devSendTodoReminder.queueId,
    scriptName: CloudflareWorkerName.esposterFunctionsDev,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: devSendTodoReminder, protect: true },
);
