import { InvalidOperationError, Operation } from "@esposter/shared";

// A response from a character pack's host, abandoned past the timeout and rejected unless the host answers OK. The status
// The caller names as absent resolves to none, so only a caller that means a missing file by it reads one as absent
export const fetchCharacterPackResponse = async (
  url: string,
  timeoutMs: number,
  absentStatus?: number,
): Promise<Response | undefined> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (response.status === absentStatus) return undefined;
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
  return response;
};
