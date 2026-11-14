import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const devSendTodoReminderDeadLetterQueue: cloudflare.Queue = new cloudflare.Queue(
  "queue-dev-send-todo-reminder-dlq",
  { accountId: CloudflareAccountId, queueName: "dev-send-todo-reminder-dlq" },
  { protect: true },
);
