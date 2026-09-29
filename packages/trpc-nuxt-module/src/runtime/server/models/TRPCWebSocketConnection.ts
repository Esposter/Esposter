import type { Peer } from "crossws";

// What the WebSocket handler hands its open and close callbacks: the peer, and the context the router's own context
// Factory built for it, so a callback can act as the connection's user
export interface TRPCWebSocketConnection<TContext> {
  context: TContext;
  peer: Peer;
}
