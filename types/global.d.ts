import type { WebSocketServer } from "ws";

declare global {
  // eslint-disable-next-line no-var
  var websocketServer: WebSocketServer | undefined;
}
