import { EventEmitter } from "node:events";

// The server tRPC's `applyWSSHandler` drives, the members its `WSServer` names: it listens for `connection` and walks
// `clients` to broadcast its reconnect notification. A connection is announced by emitting `connection` with the client
// And its request, which registers the client until it closes. trpc-msw imports this class as well, and its client
// Adapter extends `WebSocketClientAdapter`
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
