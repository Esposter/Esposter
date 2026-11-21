import { InvalidOperationError, Operation } from "@esposter/shared";

// A host's file fetched under a timeout and rejected unless the host answers OK. Given the status a missing file
// Answers, it resolves to none for that status, and a call that names no such status is never given none
export function readFileResponse(url: string, timeoutMs: number, absentStatus: number): Promise<Response | undefined>;
export function readFileResponse(url: string, timeoutMs: number): Promise<Response>;
export async function readFileResponse(url: string, timeoutMs: number, absentStatus?: number) {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (response.status === absentStatus) return undefined;
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
  return response;
}
