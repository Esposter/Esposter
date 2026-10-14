import { DATA_FETCH_TIMEOUT_MS } from "#src/services/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One file as the host serves it, rejected when its fetch fails or does not answer in time
export const readFileResponse = async (url: string): Promise<Response> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(DATA_FETCH_TIMEOUT_MS) });
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
  return response;
};
