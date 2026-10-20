import type { serverFetch } from "nitro/app";

import { useNuxtApp } from "nuxt/app";

declare module "nuxt/app" {
  interface NuxtApp {
    $trpcServerFetch: typeof serverFetch;
  }
}

// The Nitro app's in-process fetch the server plugin provides. The app is captured when the link is built, but the
// Property is read on each call, so the order the plugins run in does not matter
export const useTrpcServerFetch = (): typeof serverFetch => {
  const nuxtApp = useNuxtApp();
  return (resource, init, context) => nuxtApp.$trpcServerFetch(resource, init, context);
};
