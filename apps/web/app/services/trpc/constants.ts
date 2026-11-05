export const TRPC_CLIENT_PATH = "/api/trpc";
export const TRPC_WS_PATH = "/ws";
// The client's ping on its WebSocket, which notices a socket that dropped with no close. Without it, that drop shows
// Only when the client next sends
export const TRPC_WS_KEEP_ALIVE_INTERVAL_MS = 30_000;
export const TRPC_WS_KEEP_ALIVE_PONG_TIMEOUT_MS = 5000;
// The codes the error link alerts on itself
export const ALERTED_ERROR_CODES: ReadonlySet<string> = new Set([
  "BAD_REQUEST",
  "TOO_MANY_REQUESTS",
  "UNPROCESSABLE_CONTENT",
]);
// Every code the error link answers, so a caller alerting its own rejection leaves them to it: the ones it alerts, and
// A missing session, which it sends to login and alerts only where it cannot
export const ANSWERED_ERROR_CODES: ReadonlySet<string> = new Set([...ALERTED_ERROR_CODES, "UNAUTHORIZED"]);
