import type { StorageQueueOutput } from "@azure/functions";
import type { WebhookPayload } from "@esposter/shared";

import { app } from "@azure/functions";
import { webhookPayloadSchema } from "@esposter/shared";
import z, { ZodError } from "zod";

export interface WebhookQueueMessage {
  payload: WebhookPayload;
  webhookId: string;
}

export const webhookQueueName = "webhook-jobs";
const storageQueueOutput: StorageQueueOutput = {
  connection: "AzureWebJobsStorage",
  name: "outputQueueItem",
  queueName: webhookQueueName,
  type: "queue",
};

app.http("webhook", {
  authLevel: "anonymous",
  extraOutputs: [storageQueueOutput],
  handler: async (request, context) => {
    context.log(`Webhook trigger function processed a request for URL: ${request.url}`);

    const webhookId = request.params.webhookId;
    if (!webhookId)
      return {
        jsonBody: { message: "Webhook ID is required in the URL." },
        status: 400,
      };

    try {
      const body = await request.json();
      const payload = webhookPayloadSchema.parse(body);
      const queueMessage = { payload, webhookId };
      context.log(`Queued job for webhookId: ${webhookId}`);
      return {
        httpResponse: {
          jsonBody: { message: "Webhook accepted and queued for processing." },
          status: 202,
        },
        outputQueueItem: queueMessage,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = z.treeifyError(error);
        context.log("Validation failed:", errors);
        return {
          jsonBody: {
            errors,
            message: "Invalid request body.",
          },
          status: 400,
        };
      }

      context.error("An internal error occurred:", error);
      return {
        jsonBody: { message: "An internal server error occurred." },
        status: 500,
      };
    }
  },
  methods: ["POST"],
  route: "webhooks/{webhookId}",
});
