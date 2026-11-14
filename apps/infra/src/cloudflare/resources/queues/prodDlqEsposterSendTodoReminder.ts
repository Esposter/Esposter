import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const prodDlqEsposterSendTodoReminder: cloudflare.Queue = new cloudflare.Queue(
  "queue-send-todo-reminder-dlq",
  { accountId: CloudflareAccountId, queueName: "send-todo-reminder-dlq" },
  { protect: true },
);
