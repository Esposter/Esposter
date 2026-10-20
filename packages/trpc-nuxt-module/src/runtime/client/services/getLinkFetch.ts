import type { TRPCFetch } from "@trpc/client";
import type { serverFetch } from "nitro/app";

import { checkIsServer } from "@esposter/shared";
import { fetchWithEvent, getProxyRequestHeaders } from "nitro/h3";
import { useNuxtApp, useRequestEvent } from "nuxt/app";

declare module "nuxt/app" {
  interface NuxtApp {
    $trpcServerFetch: typeof serverFetch;
  }
}

// During server rendering, a fetch through the request's own event: the app answers a path in-process, the incoming
// Request's headers forwarded, and returns a real `Response`, headers included. An event no app built has no app to
// Answer it, so the same request goes through the Nitro app's own in-process fetch, which the server plugin provides.
// In the browser, the global `fetch` against an absolute url, which is what a network interceptor sees. Read when the
// Link is built, inside the app's context, since a link sends later — a batch after a tick — when that context is gone
export const getLinkFetch = (): TRPCFetch => {
  if (checkIsServer()) {
    const event = useRequestEvent();
    if (event?.app) return (url, options) => fetchWithEvent(event, url, options);
    if (event) {
      const nuxtApp = useNuxtApp();
      return (url, options) => {
        const headers = new Headers(getProxyRequestHeaders(event, { host: true }));
        new Headers(options?.headers).forEach((value, name) => headers.set(name, value));
        return nuxtApp.$trpcServerFetch(new URL(url, event.url), { ...options, headers }, event.context);
      };
    }
  }
  return (input, init) => fetch(new URL(input, window.location.href), init);
};
