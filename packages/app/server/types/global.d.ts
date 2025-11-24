import type { PeerServerInstance } from "peer";
import type { WebSocketServer } from "ws";

declare global {
  var websocketServer: undefined | WebSocketServer;
  var peerServer: PeerServerInstance | undefined;
}
