import { FETCH_TIMEOUT_MS } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every request a script makes, bounded and checked in one place: a fetch with no timeout hangs a release run on a
// Registry that stopped answering, and a non-2xx body read as the payload reads as a malformed answer rather than as
// The refusal it was. A large download passes a longer bound
export const fetchOk = async (url: string, timeoutMs: number = FETCH_TIMEOUT_MS): Promise<Response> => {
  // oxlint-disable-next-line no-restricted-globals -- the one request of this tree, which the ban routes every other through
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, fetchOk.name, `${url}: ${response.status} ${response.statusText}`);
  return response;
};
