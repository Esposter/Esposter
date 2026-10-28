import { FETCH_TIMEOUT_MS } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every request a script makes, bounded in one place: a fetch with no timeout hangs a release run on a registry that
// Stopped answering. A large download passes a longer bound, and a registry asking for a token takes it as a header. The
// Response comes back whatever its status, for a caller that reads one status as an answer rather than a refusal
export const fetchResponse = (
  url: string,
  { headers, timeoutMs = FETCH_TIMEOUT_MS }: { headers?: Record<string, string>; timeoutMs?: number } = {},
): Promise<Response> =>
  // oxlint-disable-next-line no-restricted-globals -- the one request of this tree, which the ban routes every other through
  fetch(url, { headers, signal: AbortSignal.timeout(timeoutMs) });

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
