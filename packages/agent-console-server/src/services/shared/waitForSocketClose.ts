import type { WebSocket } from "ws";

// Resolves with the close code once the socket has closed. An error before the close does not end the wait: a refused
// Connect or an unreadable frame emits one first, and `once(socket, "close")` would reject on it instead of waiting
export const waitForSocketClose = (webSocket: WebSocket): Promise<number> => {
  const closed = Promise.withResolvers<number>();
  webSocket.once("close", closed.resolve);
  return closed.promise;
};
