import type { WebSocketHandlerConnection } from "msw";

import { toBuffer } from "#src/services/toBuffer";
import { EventEmitter } from "node:events";

type MswWebSocketClient = WebSocketHandlerConnection["client"];

// Presents an msw client connection as the `ws.WebSocket` tRPC's connection handler drives, so the protocol on
// The wire is tRPC's own rather than a copy of it
export class MswWebSocketAdapter extends EventEmitter {
  readonly CLOSED: number = WebSocket.CLOSED;
  readonly CLOSING: number = WebSocket.CLOSING;
  readonly CONNECTING: number = WebSocket.CONNECTING;
  readonly OPEN: number = WebSocket.OPEN;
  readyState: number = WebSocket.OPEN;
  readonly #client: MswWebSocketClient;

  constructor(client: MswWebSocketClient) {
    super();
    this.#client = client;
    client.addEventListener("message", (event) => {
      this.emit("message", toBuffer(event.data), false);
    });
    client.addEventListener("close", (event) => {
      this.readyState = WebSocket.CLOSED;
      this.emit("close", event.code, event.reason);
    });
  }

  close(code?: number, reason?: string): void {
    this.readyState = WebSocket.CLOSING;
    this.#client.close(code, reason);
  }

  send(data: string): void {
    this.#client.send(data);
  }

  terminate(): void {
    this.close();
  }
}
