import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import type { NuxtHooks } from "nuxt/schema";

// Nitro's Vite environment carries the dev server its own upgrade listener forwards to, which Vite's types do not know
interface NitroDevEnvironment {
  devServer: {
    upgrade?: (context: { node: { head: Buffer; req: IncomingMessage; socket: Duplex } }) => Promise<void> | void;
  };
}

const checkIsNitroDevEnvironment = (environment: object): environment is NitroDevEnvironment =>
  "devServer" in environment;

export const hooks: Pick<NuxtHooks, "listen" | "ready"> = {
  // The CLI hands a raw upgrade socket on before anything attaches an error listener to it, and a websocket client
  // Resetting in that window emits an unhandled 'error' on a bare socket, which kills the dev process
  listen: (listenerServer) => {
    listenerServer.on("upgrade", (_request, socket) => {
      socket.on("error", (error: NodeJS.ErrnoException) => {
        if (error.code !== "ECONNRESET" && error.code !== "EPIPE") console.error(error);
      });
    });
  },
  // @TODO: no upstream issue — under Nuxt 5's Nitro Vite environment the dev server Nuxt hands the CLI has no `upgrade`,
  // So `nuxt dev` drops every WebSocket upgrade; each is forwarded to the Nitro environment as Nitro's own listener would
  ready: (nuxt) => {
    if (!nuxt.options.dev) return;
    // Registered from here rather than in the configuration's hooks so it runs after the Nitro server's own, which is
    // What sets `nuxt.server`
    nuxt.hook("vite:serverCreated", (viteServer, { isServer }) => {
      const environment = viteServer.environments.nitro;
      if (!isServer || !nuxt.server || !environment || !checkIsNitroDevEnvironment(environment)) return;
      // The CLI neither awaits nor catches the upgrade, and Nitro's rejects when its runner cannot proxy one — an
      // Unhandled rejection that would end the dev process — so a failed one is logged and its socket closed here
      nuxt.server.upgrade = async (req: IncomingMessage, socket: Duplex, head: Buffer) => {
        const [outcome] = await Promise.allSettled([
          Promise.try(() => environment.devServer.upgrade?.({ node: { head, req, socket } })),
        ]);
        if (outcome.status === "fulfilled") return;
        console.error(outcome.reason);
        socket.destroy();
      };
    });
  },
};
