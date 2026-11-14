import { CUTOVER_SECRET_HEADER } from "#src/services/cutover/constants";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";

// Calls one of the functions Worker's temporary cutover routes. The secret travels in a header and never in the URL or a message body
export const callFunctionsRoute = async (
  functionsUrl: string,
  secret: string,
  path: string,
  body?: unknown,
): Promise<unknown> => {
  const response = await getResultAsync(() =>
    fetch(new URL(path, functionsUrl), {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: {
        [CUTOVER_SECRET_HEADER]: secret,
        ...(body === undefined ? {} : { "content-type": "application/json" }),
      },
      method: "POST",
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
