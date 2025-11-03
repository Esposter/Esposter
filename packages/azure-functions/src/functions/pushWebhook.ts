import type { WebhookEventGridData } from "@/models/WebhookEventGridData";

import { db } from "@/services/db";
import { eventGridPublisherClient } from "@/services/eventGridPublisherClient";
import { app } from "@azure/functions";
import { AzureFunction, selectWebhookSchema, webhookPayloadSchema } from "@esposter/db-schema";
import { z, ZodError } from "zod";

app.http(AzureFunction.PushWebhook, {
  authLevel: "function",
  handler: async (request, context) => {
    context.log(`${AzureFunction.PushWebhook} processed a request for URL: ${request.url}`);

    try {
      const { id, token } = await selectWebhookSchema.pick({ id: true, token: true }).parseAsync(request.params);
      const webhook = await db.query.webhooks.findFirst({
        columns: { id: true, roomId: true, userId: true },
        where: (webhooks, { and, eq }) =>
          and(eq(webhooks.id, id), eq(webhooks.token, token), eq(webhooks.isActive, true)),
      });
      if (!webhook) return { jsonBody: { message: "Webhook not found." }, status: 404 };

      const body = await request.json();
      const payload = await webhookPayloadSchema.parseAsync(body);
      const data: WebhookEventGridData = { payload, webhook };
      eventGridPublisherClient.send([
        { data, dataVersion: "1.0", eventType: AzureFunction.ProcessWebhook, subject: webhook.id },
      ]);
      context.log(`Pushed to ${AzureFunction.ProcessWebhook} for webhook id: ${webhook.id}`);
      return {
        jsonBody: { message: "Webhook accepted." },
        status: 202,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = z.treeifyError(error);
        context.log("Validation failed: ", errors);
        return {
          jsonBody: { errors, message: "Invalid request body." },
          status: 400,
        };
      } else {
        context.error("An internal error occurred: ", error);
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

export default {};
