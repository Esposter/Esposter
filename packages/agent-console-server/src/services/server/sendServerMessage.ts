import type { ServerMessage } from "#src/models/server/ServerMessage";

import { WebSocket } from "ws";

// A socket that closed between the event and the send is skipped; its page is replayed the log when it reconnects
export const sendServerMessage = (webSocket: WebSocket, message: ServerMessage): void => {
  if (webSocket.readyState === WebSocket.OPEN) webSocket.send(JSON.stringify(message));
};
