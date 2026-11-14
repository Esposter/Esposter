import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const devSendTodoReminder: cloudflare.Queue = new cloudflare.Queue(
  "queue-dev-send-todo-reminder",
  { accountId: CloudflareAccountId, queueName: "dev-send-todo-reminder" },
  { protect: true },
);
