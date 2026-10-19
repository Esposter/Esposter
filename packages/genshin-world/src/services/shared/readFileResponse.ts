import type { ReadFileResponse } from "#src/models/shared/ReadFileResponse";

import { InvalidOperationError, Operation } from "@esposter/shared";

export const readFileResponse: ReadFileResponse = (async (
  url: string,
  timeoutMs: number,
  absentStatus?: number,
): Promise<Response | undefined> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (response.status === absentStatus) return undefined;
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
  return response;
}) as ReadFileResponse;
