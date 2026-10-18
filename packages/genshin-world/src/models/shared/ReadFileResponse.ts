// A host's file fetched under a timeout and rejected unless the host answers OK. Given the status a missing file
// Answers, it resolves to none for that status, and a call that names no such status is never given none
export interface ReadFileResponse {
  (url: string, timeoutMs: number, absentStatus: number): Promise<Response | undefined>;
  (url: string, timeoutMs: number): Promise<Response>;
}
