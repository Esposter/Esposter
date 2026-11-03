import { EventEmitter } from "node:events";

// The part of a `ws.WebSocketServer` tRPC's `applyWSSHandler` drives: it listens for `connection` and walks `clients`
// To broadcast its reconnect notification. A connection is announced by emitting `connection` with the client and its
// Request, which registers the client until it closes. Nothing else is declared, so the class stays a subset of the
// `ws` server, which a single `as` can stand in for. trpc-msw's is the same shape over its own client adapter
export class WebSocketServerAdapter<TClient extends EventEmitter> extends EventEmitter {
  readonly clients: Set<TClient> = new Set<TClient>();

  constructor() {
    super();
    this.on("connection", (client: TClient) => {
      this.clients.add(client);
      client.once("close", () => {
        this.clients.delete(client);
      });
    });
  }
}
