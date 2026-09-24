export const TRPC_CLIENT_PATH = "/api/trpc";
export const TRPC_WS_PATH = "/ws";
// The codes the error link alerts on itself, so a caller alerting its own rejection leaves them to it
export const ALERTED_ERROR_CODES: ReadonlySet<string> = new Set([
  "BAD_REQUEST",
  "TOO_MANY_REQUESTS",
  "UNPROCESSABLE_CONTENT",
]);
