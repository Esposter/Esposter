import type { AnyTRPCRouter } from "@trpc/server";
import type { WSSHandlerOptions } from "@trpc/server/adapters/ws";

export interface WebSocketOptions {
  // The route the WebSocket handler is registered at, and the url the client's `wsLink` connects to
  endpoint: string;
  keepAlive?: WSSHandlerOptions<AnyTRPCRouter>["keepAlive"];
}
