import type { Peer } from "crossws";

import { EventEmitter } from "node:events";

// Presents a crossws peer as the `ws.WebSocket` tRPC's connection handler drives, the shape trpc-msw presents an msw
// Connection in, so the protocol on the wire is tRPC's own. crossws reports a peer's life through the handler's hooks
// Rather than through events on the peer, so each hook is replayed here as the event `ws` would have emitted
export class PeerWebSocketAdapter extends EventEmitter {
  readonly CLOSED: number = WebSocket.CLOSED;
  readonly CLOSING: number = WebSocket.CLOSING;
  readonly CONNECTING: number = WebSocket.CONNECTING;
  readonly OPEN: number = WebSocket.OPEN;
  readyState: number = WebSocket.OPEN;
  readonly #peer: Peer;

  constructor(peer: Peer) {
    super();
    this.#peer = peer;
  }

  close(code?: number, reason?: string): void {
    this.readyState = WebSocket.CLOSING;
    this.#peer.close(code, reason);
  }

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

  send(data: string): void {
    this.#peer.send(data);
  }

  terminate(): void {
    this.readyState = WebSocket.CLOSING;
    this.#peer.terminate();
  }
}
