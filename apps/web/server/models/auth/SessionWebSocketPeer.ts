import type { Context } from "#server/trpc/context";
import type { TRPCWebSocketConnection } from "trpc-nuxt-module/runtime/server/models/TRPCWebSocketConnection";

// An open WebSocket and the session it was opened under, so a revoke of that session can close the socket
export interface SessionWebSocketPeer {
  peer: TRPCWebSocketConnection<Context>["peer"];
  sessionId: string;
}
