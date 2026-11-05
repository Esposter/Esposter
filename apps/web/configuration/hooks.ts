import type { NuxtHooks } from "nuxt/schema";

export const hooks: Pick<NuxtHooks, "listen"> = {
  // The CLI hands a raw upgrade socket on before anything attaches an error listener to it, and a websocket client
  // Resetting in that window emits an unhandled 'error' on a bare socket, which kills the dev process
  listen: (listenerServer) => {
    listenerServer.on("upgrade", (_request, socket) => {
      socket.on("error", (error: NodeJS.ErrnoException) => {
        if (error.code !== "ECONNRESET" && error.code !== "EPIPE") console.error(error);
      });
    });
  },
};
