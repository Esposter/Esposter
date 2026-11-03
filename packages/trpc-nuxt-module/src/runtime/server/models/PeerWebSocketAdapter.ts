import { WebSocketClientAdapter } from "#src/runtime/server/models/WebSocketClientAdapter";

// Presents a crossws peer as the `ws.WebSocket` tRPC's connection handler drives, the shape trpc-msw presents an msw
// Connection in, so the protocol on the wire is tRPC's own. crossws reports a peer's life through the handler's hooks
// Rather than through events on the peer, so each hook is replayed here as the event `ws` would have emitted. The
// Replays are static, because a member the class declares beyond `ws.WebSocket`'s would stop the socket being a subset
export class PeerWebSocketAdapter extends WebSocketClientAdapter {
  static receiveClose(client: PeerWebSocketAdapter, code?: number, reason?: string): void {
    client.readyState = WebSocket.CLOSED;
    client.emit("close", code, reason);
  }

  static receiveError(client: PeerWebSocketAdapter, error: unknown): void {
    client.emit("error", error);
  }

  // TRPC reads a text frame as a buffer marked not binary, which is how it tells its own heartbeat from a request
  static receiveMessage(client: PeerWebSocketAdapter, message: string): void {
    client.emit("message", Buffer.from(message), false);
  }
}
