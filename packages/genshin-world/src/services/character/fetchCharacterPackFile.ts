import { InvalidOperationError, Operation } from "@esposter/shared";

// A file of a character's pack, fetched under a timeout, where any status but ok rejects. The status the caller names as
// Absent answers none instead: only a caller asking for a file its host might not hold names one, and a caller asking
// For a file it already lists names none
export const fetchCharacterPackFile = async (
  url: string,
  timeoutMs: number,
  absentStatus?: number,
): Promise<Response | undefined> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (absentStatus !== undefined && response.status === absentStatus) return undefined;
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
  return response;
};
