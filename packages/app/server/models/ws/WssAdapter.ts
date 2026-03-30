import type { WsAdapter } from "@@/server/models/ws/WsAdapter";
import type { IncomingMessage } from "node:http";

import { EventEmitter } from "node:events";
// Minimal WebSocketServer shim for applyWSSHandler.
export class WssAdapter extends EventEmitter {
  readonly clients = new Set<WsAdapter>();

  addConnection(ws: WsAdapter, req: IncomingMessage) {
    this.clients.add(ws);
    ws.once("close", () => this.clients.delete(ws));
    this.emit("connection", ws, req);
  }

  close() {}
}
