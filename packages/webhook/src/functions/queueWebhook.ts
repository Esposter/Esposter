import type { StorageQueueOutput } from "@azure/functions";
import type { WebhookPayload } from "@esposter/shared";

import { db } from "@/services/db";
import { rateLimiter } from "@/services/rateLimiter";
import { app } from "@azure/functions";
import { selectWebhookSchema } from "@esposter/db";
import { webhookPayloadSchema } from "@esposter/shared";
import { RateLimiterRes } from "rate-limiter-flexible";
import { z, ZodError } from "zod";

export interface WebhookQueueMessage {
  id: string;
  payload: WebhookPayload;
}

export const webhookQueueName = "webhook-jobs";
const outputPropertyName = "queueMessage";
const storageQueueOutput: StorageQueueOutput = {
  connection: "AzureWebJobsStorage",
  name: outputPropertyName,
  queueName: webhookQueueName,
  type: "queue",
};

app.http("queueWebhook", {
  extraOutputs: [storageQueueOutput],
  handler: async (request, context) => {
    context.log(`Webhook trigger function processed a request for URL: ${request.url}`);

    const result = await selectWebhookSchema.pick({ id: true, token: true }).safeParseAsync(request.params);
    if (!result.success)
      return {
        jsonBody: { errors: z.treeifyError(result.error), message: "Invalid webhook ID." },
        status: 400,
      };

    const { id, token } = result.data;

    try {
      const webhook = await db.query.webhooks.findFirst({
        columns: { id: true, isActive: true, token: true },
        where: (webhooks, { and, eq }) =>
          and(eq(webhooks.id, id), eq(webhooks.token, token), eq(webhooks.isActive, true)),
      });
      if (!webhook) return { jsonBody: { message: "Webhook not found." }, status: 404 };

      await rateLimiter.consume(token);
      const body = await request.json();
      const payload = webhookPayloadSchema.parse(body);
      context.extraOutputs.set(outputPropertyName, { id, payload });
      context.log(`Queued job for id: ${id}`);
      return {
        jsonBody: { message: "Webhook accepted and queued for processing." },
        status: 202,
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
      } else if (error instanceof RateLimiterRes) {
        context.log("Rate limit exceeded:", error);
        return {
          jsonBody: { message: "Rate limit exceeded." },
          status: 429,
        };
      } else {
        context.error("An internal error occurred:", error);
        return {
          jsonBody: { message: "An internal server error occurred." },
          status: 500,
        };
      }
    }
  },
  methods: ["POST"],
  route: "webhooks/{id}/{token}",
});
