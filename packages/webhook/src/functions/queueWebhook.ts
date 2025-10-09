import { WEBHOOK_STORAGE_QUEUE_OUTPUT } from "@/services/constants";
import { db } from "@/services/db";
import { rateLimiter } from "@/services/rateLimiter";
import { app } from "@azure/functions";
import { selectWebhookSchema } from "@esposter/db";
import { webhookPayloadSchema } from "@esposter/shared";
import { RateLimiterRes } from "rate-limiter-flexible";
import { z, ZodError } from "zod";

app.http("queueWebhook", {
  extraOutputs: [WEBHOOK_STORAGE_QUEUE_OUTPUT],
  handler: async (request, context) => {
    context.log(`Webhook trigger function processed a request for URL: ${request.url}`);

    try {
      const { id, token } = await selectWebhookSchema.pick({ id: true, token: true }).parseAsync(request.params);
      const webhook = await db.query.webhooks.findFirst({
        columns: { id: true },
        where: (webhooks, { and, eq }) =>
          and(eq(webhooks.id, id), eq(webhooks.token, token), eq(webhooks.isActive, true)),
      });
      if (!webhook) return { jsonBody: { message: "Webhook not found." }, status: 404 };

      await rateLimiter.consume(token);
      const body = await request.json();
      const payload = await webhookPayloadSchema.parseAsync(body);
      context.extraOutputs.set(WEBHOOK_STORAGE_QUEUE_OUTPUT.name, { id, payload });
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
