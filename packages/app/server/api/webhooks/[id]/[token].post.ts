import { RestError } from "@azure/storage-blob";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const { id, token } = getRouterParams(event);
  const body = await readBody(event);

  try {
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
    }

    throw error;
  }
});
