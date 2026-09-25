import { FETCH_TIMEOUT_MS } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every request a script makes, bounded and checked in one place: a fetch with no timeout hangs a release run on a
// Registry that stopped answering, and a non-2xx body parsed as the payload reads as a malformed answer rather than
// As the refusal it was
export const fetchJson = async <T>(url: string): Promise<T> => {
  // oxlint-disable-next-line no-restricted-globals -- the one request of this tree, which the ban routes every other through
  const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!response.ok)
    throw new InvalidOperationError(
      Operation.Read,
      fetchJson.name,
      `${url}: ${response.status} ${response.statusText}`,
    );

  return (await response.json()) as T;
};
