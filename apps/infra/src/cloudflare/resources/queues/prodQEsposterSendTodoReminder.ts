import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import * as cloudflare from "@pulumi/cloudflare";

export const prodQEsposterSendTodoReminder: cloudflare.Queue = new cloudflare.Queue(
  "queue-send-todo-reminder",
  { accountId: CloudflareAccountId, queueName: "send-todo-reminder" },
  { protect: true },
);
