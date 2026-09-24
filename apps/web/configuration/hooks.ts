import type { NuxtHooks } from "@nuxt/schema";
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";

type Upgrade = (request: IncomingMessage, socket: Duplex, head: Buffer) => Promise<void>;

export const hooks: Pick<NuxtHooks, "listen" | "ready"> = {
  // Nitro's dev server takes ownership of the raw upgrade socket and then awaits a worker
  // Lookup (up to ~6s while rebuilding) before handing it to the proxy that would attach an
  // Error listener. A websocket client resetting inside that window emits an unhandled
  // 'error' on a bare socket, which kills the dev process.
  listen: (listenerServer) => {
    listenerServer.on("upgrade", (_request, socket) => {
      socket.on("error", (error: NodeJS.ErrnoException) => {
        if (error.code !== "ECONNRESET" && error.code !== "EPIPE") console.error(error);
      });
    });
  },
  // When that lookup finds no ready worker, Nitro rejects with "No worker available." and nothing catches it.
  // The CLI treats the unhandled rejection as fatal, restarting Nuxt and rebuilding Nitro from scratch.
  // Instead, the reconnecting client gets a closed socket and retries once the worker is up.
  ready: async (nuxt) => {
    if (!nuxt.options.dev || !nuxt.server) return;
    // Imported here rather than at the top: `nuxt prepare` loads this file on install, before @esposter/shared is built
    const { getResultAsync, noop } = await import("@esposter/shared");
    const upgrade: Upgrade = nuxt.server.upgrade;
    nuxt.server.upgrade = (request: IncomingMessage, socket: Duplex, head: Buffer) =>
      getResultAsync(() => upgrade(request, socket, head))
        .orTee(console.error)
        .match(noop, () => {
          socket.destroy();
        });
  },
};
