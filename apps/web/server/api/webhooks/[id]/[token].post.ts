import { db } from "#server/db";
import { getJobQueue } from "#server/services/queue/getJobQueue";
import { checkIsRateLimitExceeded } from "#server/services/rateLimiter/checkIsRateLimitExceeded";
import { consumeAddressRateLimit } from "#server/services/rateLimiter/consumeAddressRateLimit";
import { webhookRateLimiter } from "#server/services/rateLimiter/webhookRateLimiter";
import { getIpAddress } from "#server/services/request/getIpAddress";
import { QueueJob, selectWebhookInMessageSchema, webhookPayloadSchema } from "@esposter/db-schema";
import { getResult, getResultAsync, hashSecretToken, secretTokenSchema } from "@esposter/shared";
import { defineEventHandler, getRequestIP, getRouterParams } from "nuxt/server";
import { v7 } from "uuid";

export default defineEventHandler(async (event) => {
  const { id: rawId, token: rawToken } = getRouterParams(event);
  const { data: id, success: isIdValid } = selectWebhookInMessageSchema.shape.id.safeParse(rawId);
  const { data: token, success: isTokenValid } = secretTokenSchema.safeParse(rawToken);

  if (!(isIdValid && isTokenValid)) {
    event.res.status = 400;
    return { message: "Invalid parameters." };
  }

  const body = await event.req.text();
  return getResultAsync(async () => {
    // The address is spent first: an id matching no webhook would otherwise draw a fresh budget of its own, and nothing
    // Would cap the route across ids
    await consumeAddressRateLimit(getIpAddress(event.req.headers, getRequestIP(event) ?? ""));
    await webhookRateLimiter.consume(id);
    // The row is found by its id and the hash of the credential presented, so one lookup answers both. An unknown id,
    // A deactivated webhook and a wrong credential are the same 404, and a sender cannot tell them apart
    const tokenHash = await hashSecretToken(token);
    const webhook = await db.query.webhooksInMessage.findFirst({
      columns: { roomId: true, userId: true },
      where: { id: { eq: id }, isActive: { eq: true }, tokenHash: { eq: tokenHash } },
    });
    if (!webhook) {
      event.res.status = 404;
      return { message: "Webhook not found." };
    }

    // The payload is checked here, before anything is queued, so a malformed one is answered rather than failing its job
    const payload = getResult(() => webhookPayloadSchema.parse(JSON.parse(body))).match(
      (parsedPayload) => parsedPayload,
      () => null,
    );
    if (!payload) {
      event.res.status = 400;
      return { message: "Invalid payload." };
    }

    // Accepted once queued. The push is queued under the id it is accepted as, so a redelivery of it writes the message once
    // The job is handed the room and its app user alone, never the credential
    await getJobQueue(QueueJob.ProcessWebhook).send({
      deliveryId: v7(),
      payload,
      webhook: { roomId: webhook.roomId, userId: webhook.userId },
    });
    event.res.status = 202;
    return { message: "Accepted." };
  }).match(
    (data) => data,
    (error) => {
      if (checkIsRateLimitExceeded(error)) {
        event.res.status = 429;
        return { message: "Rate limit exceeded." };
      } else {
        console.error(String(error).replaceAll(token, "[token]"));
        event.res.status = 500;
        return { message: "An internal server error occurred." };
      }
    },
  );
});
