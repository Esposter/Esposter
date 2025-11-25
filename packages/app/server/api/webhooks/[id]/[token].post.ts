import { webhookRateLimiter } from "@@/server/services/rateLimiter/webhookRateLimiter";
import { RestError } from "@azure/storage-blob";
import { RateLimiterRes } from "rate-limiter-flexible";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const { id, token } = getRouterParams(event);
  const body = await readBody(event);

  try {
    await webhookRateLimiter.consume(id);
    const { _data, status } = await $fetch.raw<unknown>(
      `${runtimeConfig.public.azure.function.baseUrl}/api/webhooks/${id}/${token}`,
      {
        body,
        headers: {
          "Content-Type": "application/json",
          "x-functions-key": runtimeConfig.azure.function.key,
        },
        method: "POST",
      },
    );
    setResponseStatus(event, status);
    return _data;
  } catch (error) {
    if (error instanceof RestError) {
      setResponseStatus(event, error.statusCode ?? 502);
      return error.cause;
    } else if (error instanceof RateLimiterRes) {
      setResponseStatus(event, 429);
      return { message: "Rate limit exceeded." };
    } else {
      setResponseStatus(event, 500);
      return { message: "An internal server error occurred." };
    }
  }
});
