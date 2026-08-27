import { MimeType } from "#shared/models/file/MimeType";
import { checkIsRateLimitExceeded } from "@@/server/services/rateLimiter/checkIsRateLimitExceeded";
import { webhookRateLimiter } from "@@/server/services/rateLimiter/webhookRateLimiter";
import { selectWebhookInMessageSchema } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

export default defineEventHandler(async (event) => {
  const { id: rawId, token: rawToken } = getRouterParams(event);
  const { data: id, success: idSuccess } = selectWebhookInMessageSchema.shape.id.safeParse(rawId);
  const { data: token, success: tokenSuccess } = selectWebhookInMessageSchema.shape.token.safeParse(rawToken);

  if (!(idSuccess && tokenSuccess)) {
    setResponseStatus(event, 400);
    return { message: "Invalid parameters." };
  }

  const runtimeConfig = useRuntimeConfig(event);
  const body = await readBody(event);
  return getResultAsync(async () => {
    await webhookRateLimiter.consume(id);
    // This route is a thin proxy for the function that owns the webhook: it answers 404 for an unknown id or a
    // Wrong token and 400 for an invalid payload, and a rejected response would collapse every one of those into
    // The internal-error branch below, so the sender could not tell a bad credential from an Esposter outage
    const { _data, status } = await $fetch.raw<unknown>(
      `${runtimeConfig.public.azure.function.baseUrl}/api/webhooks/${id}/${token}`,
      {
        body,
        headers: {
          "Content-Type": MimeType.Json,
          "x-functions-key": runtimeConfig.azure.function.key,
        },
        ignoreResponseError: true,
        method: "POST",
      },
    );
    setResponseStatus(event, status);
    return _data;
  }).match(
    (data) => data,
    (error) => {
      if (checkIsRateLimitExceeded(error)) {
        setResponseStatus(event, 429);
        return { message: "Rate limit exceeded." };
      } else {
        console.error(error);
        setResponseStatus(event, 500);
        return { message: "An internal server error occurred." };
      }
    },
  );
});
