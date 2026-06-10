import { pushWebhook } from "@/handlers/pushWebhook";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.http(AzureFunction.PushWebhook, {
  authLevel: "function",
  handler: pushWebhook,
  methods: ["POST"],
  route: "webhooks/{id}/{token}",
});

export default {};
