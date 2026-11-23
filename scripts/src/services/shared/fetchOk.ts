import { fetchResponse } from "#src/services/shared/fetchResponse";
import { readBoundedResponse } from "#src/services/shared/readBoundedResponse";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A request that is checked and bounded: a non-2xx body read as the payload reads as a malformed answer rather than as
// The refusal it was, and a body past `maxBytes` throws. The body comes back as bytes, never as the response, so no
// Caller can read it unbounded
export const fetchOk = async (
  url: string,
  {
    headers,
    maxBytes,
    timeoutMs,
  }: { headers?: Record<string, string> | undefined; maxBytes: number; timeoutMs?: number },
): Promise<Uint8Array> => {
  const response = await fetchResponse(url, { headers, timeoutMs });
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, fetchOk.name, `${url}: ${response.status} ${response.statusText}`);
  return readBoundedResponse(response, url, maxBytes);
};
