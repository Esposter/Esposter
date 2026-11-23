import type { Socket } from "node:net";

import { noop } from "@esposter/shared";
import { createServer } from "node:net";

// Listens at the socket path, which is atomic and exclusive: a path another listener holds fails the listen, and a
// Listener That binds is the lock's holder. Resolves to the release that gives the path back, and rejects with the
// Listen's error
export const listenSocketLock = (path: string): Promise<() => void> =>
  new Promise<() => void>((resolve, reject) => {
    const server = createServer();
    const sockets = new Set<Socket>();
    server.on("connection", (socket) => {
      // A waiter only waits on its close, so an error on its own connection is left to that close
      socket.on("error", noop);
      sockets.add(socket);
      socket.once("close", () => {
        sockets.delete(socket);
      });
    });
    server.once("error", reject);
    server.listen(path, () => {
      server.off("error", reject);
      resolve(() => {
        // Closing the server removes its socket file on POSIX as libuv closes it, and nothing removes it later, so no
        // Successor's Socket is ever taken away. Each waiter's connection closes with the server, which wakes that
        // Waiter at once
        server.close();
        for (const socket of sockets) socket.destroy();
      });
    });
  });
