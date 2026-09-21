import type { Socket } from "node:net";

import { VOICE_SOCKET_PATH } from "#src/services/constants";
import { createConnection } from "node:net";

// One connection to the resident synthesizer, or nothing when no server answers at the address. The error handler
// Stays on for the socket's life: a server that dies under a request raises one, and an unhandled one throws
export const openVoiceSocket = (): Promise<Socket | undefined> =>
  new Promise((resolve) => {
    const socket = createConnection(VOICE_SOCKET_PATH);
    socket.setEncoding("utf8");
    socket.on("connect", () => {
      resolve(socket);
    });
    socket.on("error", () => {
      resolve(undefined);
    });
  });
