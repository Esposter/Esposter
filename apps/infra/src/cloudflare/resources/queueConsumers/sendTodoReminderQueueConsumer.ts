import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareWorkerName from "#src/cloudflare/constants/CloudflareWorkerName";
import QueueConsumerRetry from "#src/cloudflare/constants/QueueConsumerRetry";
import { sendTodoReminder } from "#src/cloudflare/resources/queues/sendTodoReminder";
import { sendTodoReminderDeadLetterQueue } from "#src/cloudflare/resources/queues/sendTodoReminderDeadLetterQueue";
import * as cloudflare from "@pulumi/cloudflare";

export const sendTodoReminderQueueConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  "queueConsumer-send-todo-reminder",
  {
    accountId: CloudflareAccountId,
    deadLetterQueue: sendTodoReminderDeadLetterQueue.queueName,
    queueId: sendTodoReminder.queueId,
    scriptName: CloudflareWorkerName.esposterFunctions,
    settings: QueueConsumerRetry.idempotent,
    type: "worker",
  },
  { parent: sendTodoReminder, protect: true },
);
