import { fetchResponse } from "#src/services/shared/fetchResponse";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A request that is checked: a non-2xx body read as the payload reads as a malformed answer rather than as the refusal it was
export const fetchOk = async (
  url: string,
  options: { headers?: Record<string, string>; timeoutMs?: number } = {},
): Promise<Response> => {
  const response = await fetchResponse(url, options);
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, fetchOk.name, `${url}: ${response.status} ${response.statusText}`);
  return response;
};
