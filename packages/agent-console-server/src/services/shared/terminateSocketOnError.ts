import type { WebSocket } from "ws";

// A socket's error ends that socket and nothing beside it: a frame it cannot read, or one over its limit, is logged and
// Its socket terminated, so every host that owns sockets holds the same policy
export const terminateSocketOnError = (webSocket: WebSocket): void => {
  webSocket.on("error", (error) => {
    console.error(error);
    webSocket.terminate();
  });
};
