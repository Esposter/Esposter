import type { NuxtHooks } from "@nuxt/schema";
// Nitro's dev server takes ownership of the raw upgrade socket and then awaits a worker
// lookup (up to ~6s while rebuilding) before handing it to the proxy that would attach an
// error listener. A websocket client resetting inside that window emits an unhandled
// 'error' on a bare socket, which kills the dev process.
export const hooks: Pick<NuxtHooks, "listen"> = {
  listen: (listenerServer) => {
    listenerServer.on("upgrade", (_request, socket) => {
      socket.on("error", (error: NodeJS.ErrnoException) => {
        if (error.code !== "ECONNRESET" && error.code !== "EPIPE") console.error(error);
      });
    });
  },
};
