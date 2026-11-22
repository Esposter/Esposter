import { InvalidOperationError, Operation } from "@esposter/shared";

// A host's file fetched under a timeout and rejected unless the host answers OK
export const readFileResponse = async (url: string, timeoutMs: number): Promise<Response> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
  return response;
};
