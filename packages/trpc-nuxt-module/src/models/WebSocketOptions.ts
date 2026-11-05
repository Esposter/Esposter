import type { AnyTRPCRouter } from "@trpc/server";
import type { WSSHandlerOptions } from "@trpc/server/adapters/ws";

export interface WebSocketOptions {
  // The route the WebSocket handler is registered at, and the url the client's `wsLink` connects to
  endpoint: string;
  // The handler's ping of each connection, which a tRPC client answers. A client link's own keep-alive is set by the app
  keepAlive?: WSSHandlerOptions<AnyTRPCRouter>["keepAlive"];
}
