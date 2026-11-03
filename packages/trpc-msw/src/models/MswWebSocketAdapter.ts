import type { WebSocketHandlerConnection } from "msw";

import { toBuffer } from "#src/services/toBuffer";
import { WebSocketClientAdapter } from "trpc-nuxt-module/runtime/server/models/WebSocketClientAdapter";

type MswWebSocketClient = WebSocketHandlerConnection["client"];

// Presents an msw client connection as the `ws.WebSocket` tRPC's connection handler drives, so the protocol on
// The wire is tRPC's own rather than a copy of it
export class MswWebSocketAdapter extends WebSocketClientAdapter {
  constructor(client: MswWebSocketClient) {
    super({
      close: (code, reason) => {
        client.close(code, reason);
      },
      send: (data) => {
        client.send(data);
      },
      terminate: () => {
        client.close();
      },
    });
    client.addEventListener("message", (event) => {
      this.emit("message", toBuffer(event.data), false);
    });
    client.addEventListener("close", (event) => {
      this.readyState = WebSocket.CLOSED;
      this.emit("close", event.code, event.reason);
    });
  }
}
