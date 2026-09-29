import type { IncomingMessage } from "node:http";

import { EventEmitter } from "node:events";

// The part of a `ws.WebSocketServer` tRPC's `applyWSSHandler` drives: it listens for `connection` and walks
// `clients` to broadcast its reconnect notification
export class WebSocketServerAdapter<TClient extends EventEmitter> extends EventEmitter {
  readonly clients: Set<TClient> = new Set<TClient>();

  addConnection(client: TClient, request: IncomingMessage): void {
    this.clients.add(client);
    client.once("close", () => {
      this.clients.delete(client);
    });
    this.emit("connection", client, request);
  }
}
