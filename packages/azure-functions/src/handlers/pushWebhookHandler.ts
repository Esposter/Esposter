import type { WebhookEventGridData } from "@/models/WebhookEventGridData";
import type { HttpHandler } from "@azure/functions";

import { db } from "@/services/db";
import { eventGridPublisherClient } from "@/services/eventGridPublisherClient";
import { AzureFunction, selectWebhookInMessageSchema, webhookPayloadSchema } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";
import { z, ZodError } from "zod";

export const pushWebhookHandler: HttpHandler = (request, context) => {
  context.log(`${AzureFunction.PushWebhook} received a request`);
  return getResultAsync(async () => {
    const { id, token } = await selectWebhookInMessageSchema.pick({ id: true, token: true }).parseAsync(request.params);
    const webhook = await db.query.webhooksInMessage.findFirst({
      columns: { id: true, roomId: true, userId: true },
      where: { id: { eq: id }, isActive: { eq: true }, token: { eq: token } },
    });
    if (!webhook) return { jsonBody: { message: "Webhook not found." }, status: 404 };

    const body = await request.json();
    const payload = await webhookPayloadSchema.parseAsync(body);
    const data: WebhookEventGridData = { payload, webhook };
    await eventGridPublisherClient.send([
      { data, dataVersion: "1.0", eventType: AzureFunction.ProcessWebhook, subject: webhook.id },
    ]);
    context.log(`Pushed to ${AzureFunction.ProcessWebhook} for webhook id: ${webhook.id}`);
    return {
      jsonBody: { message: "Webhook accepted." },
      status: 202,
    };
  }).match(
    (response) => response,
    (error) => {
      if (error instanceof ZodError) {
        const errors = z.treeifyError(error);
        context.log("Validation failed: ", errors);
        return {
          jsonBody: { errors, message: "Invalid request." },
          status: 400,
        };
      } else if (error instanceof SyntaxError)
        return {
          jsonBody: { message: "Malformed JSON body." },
          status: 400,
        };
      else {
        context.error("An internal error occurred: ", error);
        return {
          jsonBody: { message: "An internal server error occurred." },
          status: 500,
        };
      }
    },
  );
};
