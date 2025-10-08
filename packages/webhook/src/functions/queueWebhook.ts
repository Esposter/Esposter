import type { StorageQueueOutput } from "@azure/functions";
import type { WebhookPayload } from "@esposter/shared";

import { app } from "@azure/functions";
import { rateLimiterFlexible, schema } from "@esposter/db";
import { webhookPayloadSchema } from "@esposter/shared";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { RateLimiterDrizzleNonAtomic, RateLimiterRes } from "rate-limiter-flexible";
import { z, ZodError } from "zod";

export interface WebhookQueueMessage {
  payload: WebhookPayload;
  webhookId: string;
}

export const webhookQueueName = "webhook-jobs";
const outputPropertyName = "queueMessage";
const storageQueueOutput: StorageQueueOutput = {
  connection: "AzureWebJobsStorage",
  name: outputPropertyName,
  queueName: webhookQueueName,
  type: "queue",
};
const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });
const rateLimiter = new RateLimiterDrizzleNonAtomic({
  blockDuration: 60,
  duration: 60,
  points: 30,
  schema: rateLimiterFlexible,
  storeClient: db,
});

app.http("queueWebhook", {
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
      const token = request.headers.get("authorization");
      if (!token) return { jsonBody: { message: "Missing webhook token." }, status: 401 };

      const webhook = await db.query.webhooks.findFirst({
        columns: { id: true, isActive: true, token: true },
        where: (webhooks, { and, eq }) =>
          and(eq(webhooks.id, webhookId), eq(webhooks.token, token), eq(webhooks.isActive, true)),
      });
      if (!webhook) return { jsonBody: { message: "Webhook not found." }, status: 404 };

      await rateLimiter.consume(token);
      const body = await request.json();
      const payload = webhookPayloadSchema.parse(body);
      context.extraOutputs.set(outputPropertyName, { payload, webhookId });
      context.log(`Queued job for webhookId: ${webhookId}`);
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
  route: "webhooks/{webhookId}",
});
