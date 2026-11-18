import type { Socket } from "node:net";

// Resolves when the connection closes, which a holder's exit or its release does, so a waiter wakes on the event itself
export const waitForSocketClose = (socket: Socket): Promise<void> => {
  const { promise, resolve } = Promise.withResolvers<void>();
  socket.once("close", () => {
    resolve();
  });
  return promise;
};
