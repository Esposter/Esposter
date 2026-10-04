import type { TRPCFetch } from "@trpc/client";

import { checkIsServer } from "@esposter/shared";
import { fetchWithEvent } from "nitro/h3";
import { useRequestEvent } from "nuxt/app";

// During server rendering, a fetch through the request's own event: the app answers a path in-process, the incoming
// Request's headers forwarded, and returns a real `Response`, headers included. In the browser, the global `fetch`
// Against an absolute url, which is what a network interceptor sees. Read when the link is built, inside the app's
// Context, since a link sends later — a batch after a tick — when that context is gone
export const getLinkFetch = (): TRPCFetch => {
  if (checkIsServer()) {
    const event = useRequestEvent();
    if (event) return (url, options) => fetchWithEvent(event, url, options);
  }
  return (input, init) => fetch(new URL(input, window.location.href), init);
};
