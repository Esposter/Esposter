import { pushWebhookHandler } from "@/handlers/pushWebhookHandler";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.http(AzureFunction.PushWebhook, {
  authLevel: "function",
  handler: pushWebhookHandler,
  methods: ["POST"],
  route: "webhooks/{id}/{token}",
});

export default {};
