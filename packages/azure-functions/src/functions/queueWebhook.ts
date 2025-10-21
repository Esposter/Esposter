import { WEBHOOK_STORAGE_QUEUE_OUTPUT } from "@/services/constants";
import { db } from "@/services/db";
import { app } from "@azure/functions";
import { selectWebhookSchema, webhookPayloadSchema } from "@esposter/db-schema";
import { z, ZodError } from "zod";

const name = "queueWebhook";

app.http(name, {
  authLevel: "function",
  extraOutputs: [WEBHOOK_STORAGE_QUEUE_OUTPUT],
  handler: async (request, context) => {
    context.log(`${name} processed a request for URL: ${request.url}`);

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
      context.extraOutputs.set(WEBHOOK_STORAGE_QUEUE_OUTPUT.name, { payload, webhook });
      context.log(`Queued ${WEBHOOK_STORAGE_QUEUE_OUTPUT.queueName} for webhook id: ${webhook.id}`);
      return {
        jsonBody: { message: "Webhook accepted and queued for processing." },
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
