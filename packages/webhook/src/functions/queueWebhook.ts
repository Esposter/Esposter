import type { StorageQueueOutput } from "@azure/functions";
import type { WebhookPayload } from "@esposter/shared";

import { app } from "@azure/functions";
import { webhookPayloadSchema } from "@esposter/shared";
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

// interface DbWebhookRow {
//   id: string;
//   isActive: boolean;
//   token: string;
// }

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

    // let client: null | ReturnType<typeof postgres> = null;
    try {
      const token = request.headers.get("authorization");
      if (!token) return { jsonBody: { message: "Missing webhook token." }, status: 401 };

      // client = postgres(process.env.DATABASE_URL);
      // const rows = await client<
      //   DbWebhookRow[]
      // >`select id, is_active as "isActive", secret from "message"."webhooks" where id = ${webhookId} limit 1`;
      // const hook = rows?.[0];
      // if (!hook) return { jsonBody: { message: "Webhook not found." }, status: 404 };
      // if (!hook.isActive) return { jsonBody: { message: "Webhook is inactive." }, status: 403 };
      // if (hook.token !== token) return { jsonBody: { message: "Invalid webhook token." }, status: 401 };

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
      }

      context.error("An internal error occurred:", error);
      return {
        jsonBody: { message: "An internal server error occurred." },
        status: 500,
      };
    } finally {
      // if (client) await client.end({ timeout: 1 });
    }
  },
  methods: ["POST"],
  route: "webhooks/{webhookId}",
});
