import type { TRPCFetch } from "@trpc/client";

import { checkIsServer } from "@esposter/shared";
import { fetchWithEvent, getProxyRequestHeaders } from "nitro/h3";
import { useRequestEvent } from "nuxt/app";

// During server rendering, a fetch through the request's own event: the app answers a path in-process, the incoming
// Request's headers forwarded, and returns a real `Response`, headers included. An event no app built has nothing to
// Answer it in-process, so the same request goes to the request's own origin with the same headers. In the browser, the
// Global `fetch` against an absolute url, which is what a network interceptor sees. Read when the link is built, inside
// The app's context, since a link sends later — a batch after a tick — when that context is gone
export const getLinkFetch = (): TRPCFetch => {
  if (checkIsServer()) {
    const event = useRequestEvent();
    if (event?.app) return (url, options) => fetchWithEvent(event, url, options);
    if (event)
      return (url, options) => {
        const headers = new Headers(getProxyRequestHeaders(event, { host: true }));
        new Headers(options?.headers).forEach((value, name) => headers.set(name, value));
        return fetch(new URL(url, event.url), { ...options, headers });
      };
  }
  return (input, init) => fetch(new URL(input, window.location.href), init);
};
