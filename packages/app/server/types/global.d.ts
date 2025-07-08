import type { WebSocketServer } from "ws";

declare global {
  var websocketServer: undefined | WebSocketServer;
}
