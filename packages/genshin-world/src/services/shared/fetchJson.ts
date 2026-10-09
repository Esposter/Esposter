import { DATA_FETCH_TIMEOUT_MS } from "#src/services/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One JSON document as the host serves it, rejected when its fetch fails or does not answer in time. The body is parsed by
// The reader that asked for it, so a host answering with a page for a missing file fails there
export const fetchJson = async (url: string): Promise<unknown> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(DATA_FETCH_TIMEOUT_MS) });
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
  const json: unknown = await response.json();
  return json;
};
