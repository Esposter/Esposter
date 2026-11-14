import { CUTOVER_REQUEST_TIMEOUT_MS, CUTOVER_SECRET_HEADER } from "#src/services/cutover/constants";
import { fetchResponse } from "#src/services/shared/fetchResponse";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";

// Calls one of the functions Worker's temporary cutover routes. The secret travels in a header and never in the URL or a message body
export const callFunctionsRoute = async (
  functionsUrl: string,
  secret: string,
  path: string,
  body?: unknown,
): Promise<unknown> => {
  const response = await getResultAsync(() =>
    fetchResponse(new URL(path, functionsUrl).href, {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: {
        [CUTOVER_SECRET_HEADER]: secret,
        ...(body === undefined ? {} : { "content-type": "application/json" }),
      },
      method: "POST",
      timeoutMs: CUTOVER_REQUEST_TIMEOUT_MS,
    }),
  ).match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
  if (!response.ok)
    throw new InvalidOperationError(Operation.Update, path, `the functions Worker answered HTTP ${response.status}`);
  return response.json();
};
