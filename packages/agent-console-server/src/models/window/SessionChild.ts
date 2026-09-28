import type { WebSocket } from "ws";

// A session's window as the host holds it: the socket it connected back on, and the forwarded commands still waiting
// On its reply, keyed by command id
export interface SessionChild {
  // Where its session runs, which the host lists the session by before its transcript is on disk
  cwd: string;
  pendingReplyMap: Map<string, PromiseWithResolvers<string>>;
  webSocket: WebSocket;
}
