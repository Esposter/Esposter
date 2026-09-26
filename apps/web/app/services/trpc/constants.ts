export const TRPC_CLIENT_PATH = "/api/trpc";
export const TRPC_WS_PATH = "/ws";
// The codes the error link alerts on itself
export const ALERTED_ERROR_CODES: ReadonlySet<string> = new Set([
  "BAD_REQUEST",
  "TOO_MANY_REQUESTS",
  "UNPROCESSABLE_CONTENT",
]);
// Every code the error link answers, so a caller alerting its own rejection leaves them to it: the ones it alerts, and
// A missing session, which it sends to login and alerts only where it cannot
export const ANSWERED_ERROR_CODES: ReadonlySet<string> = new Set([...ALERTED_ERROR_CODES, "UNAUTHORIZED"]);
