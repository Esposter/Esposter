import { checkIsRateLimitExceeded } from "#server/services/rateLimiter/checkIsRateLimitExceeded";
import { consumeAddressRateLimit } from "#server/services/rateLimiter/consumeAddressRateLimit";
import { webhookRateLimiter } from "#server/services/rateLimiter/webhookRateLimiter";
import { getIpAddress } from "#server/services/request/getIpAddress";
import { MimeType } from "#shared/models/file/MimeType";
import { selectWebhookInMessageSchema } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";
import { defineEventHandler, getRequestIP, getRouterParams } from "nuxt/server";

export default defineEventHandler(async (event) => {
  const { id: rawId, token: rawToken } = getRouterParams(event);
  const { data: id, success: isIdValid } = selectWebhookInMessageSchema.shape.id.safeParse(rawId);
  const { data: token, success: isTokenValid } = selectWebhookInMessageSchema.shape.token.safeParse(rawToken);

  if (!(isIdValid && isTokenValid)) {
    event.res.status = 400;
    return { message: "Invalid parameters." };
  }

  // Passed through as it arrived, since the function validates the payload and answers its own 400
  const body = await event.req.text();
  return getResultAsync(async () => {
    // The address is spent first: an id matching no webhook would otherwise draw a fresh budget of its own, and nothing
    // Would cap the route across ids
    await consumeAddressRateLimit(getIpAddress(event.req.headers, getRequestIP(event) ?? ""));
    await webhookRateLimiter.consume(id);
    // This route is a thin proxy for the function that owns the webhook: it answers 404 for an unknown id or a
    // Wrong token and 400 for an invalid payload, and its response is returned as it came back so the sender
    // Can tell a bad credential from an Esposter outage
    return fetch(`${process.env.AZURE_FUNCTION_BASE_URL}/api/webhooks/${id}/${token}`, {
      body,
      headers: { "Content-Type": MimeType.Json, "x-functions-key": process.env.AZURE_FUNCTION_KEY },
      method: "POST",
    });
  }).match(
    (data) => data,
    (error) => {
      if (checkIsRateLimitExceeded(error)) {
        event.res.status = 429;
        return { message: "Rate limit exceeded." };
      } else {
        // A failed fetch names the url it asked, and the url carries the webhook's token, which is its credential
        console.error(String(error).replaceAll(token, "[token]"));
        event.res.status = 500;
        return { message: "An internal server error occurred." };
      }
    },
  );
});
