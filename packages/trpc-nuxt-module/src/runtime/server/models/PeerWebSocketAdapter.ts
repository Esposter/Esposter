import { WebSocketClientAdapter } from "@esposter/shared-node/websocket";

// Presents a crossws peer as the client tRPC's connection handler drives, the shape trpc-msw presents an msw connection
// In, so the protocol on the wire is tRPC's own. crossws reports a peer's life through the handler's hooks rather than
// Through events on the peer, so each hook is replayed here as the event `ws` would have emitted
export class PeerWebSocketAdapter extends WebSocketClientAdapter {
  receiveClose(code?: number, reason?: string): void {
    this.readyState = WebSocket.CLOSED;
    this.emit("close", code, reason);
  }

  receiveError(error: unknown): void {
    this.emit("error", error);
  }

  // TRPC reads a text frame as a buffer marked not binary, which is how it tells its own heartbeat from a request
  receiveMessage(message: string): void {
    this.emit("message", Buffer.from(message), false);
  }
}
