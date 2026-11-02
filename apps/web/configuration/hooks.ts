import type { NuxtHooks } from "nuxt/schema";

import { useNuxt } from "nuxt/kit";

export const hooks: Pick<NuxtHooks, "listen" | "modules:before"> = {
  // The CLI hands a raw upgrade socket on before anything attaches an error listener to it, and a websocket client
  // Resetting in that window emits an unhandled 'error' on a bare socket, which kills the dev process
  listen: (listenerServer) => {
    listenerServer.on("upgrade", (_request, socket) => {
      socket.on("error", (error: NodeJS.ErrnoException) => {
        if (error.code !== "ECONNRESET" && error.code !== "EPIPE") console.error(error);
      });
    });
  },
  // @TODO: no upstream issue — the nightlies are versioned `5.0.0-<timestamp>-<sha>`, which kit's nightly-suffix strip
  // (`/-\d+\.[0-9a-f]+/`, written for `-<build>.<sha>`) leaves in place, so Nuxt reads as a prerelease below every
  // `^5.0.0` and kit silently disables each module declaring one — `@pinia/nuxt` among them, taking `defineStore` with
  // It. The suffix is stripped once, before any module's compatibility is checked
  "modules:before": () => {
    const nuxt = useNuxt();
    // oxlint-disable-next-line no-underscore-dangle -- `_version` is Nuxt's own field, the one kit reads the version from
    nuxt._version = nuxt._version.replace(/-\d+-[\da-f]+$/u, "");
  },
};
