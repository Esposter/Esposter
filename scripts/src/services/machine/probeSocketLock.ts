import type { Socket } from "node:net";

import { createConnection } from "node:net";

// Connects to the socket path: a connection is a live holder's, and a failed connect rejects with what the path holds, if anything
export const probeSocketLock = (path: string): Promise<Socket> =>
  new Promise<Socket>((resolve, reject) => {
    const socket = createConnection(path);
    socket.once("connect", () => {
      resolve(socket);
    });
    // Once connected, an error is no answer to the probe, and the close that follows it is the signal a waiter waits on
    socket.on("error", reject);
  });
