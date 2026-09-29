import type { TRPCFetch } from "@trpc/client";

import { checkIsServer } from "@esposter/shared";
import { useRequestEvent } from "nuxt/app";

// During server rendering, the request event's `fetch`: Nitro answers it in-process, forwards the incoming request's
// Headers and returns a real `Response`, headers included. In the browser, the global `fetch` against an absolute url,
// Which is what a network interceptor sees. Read when the link is built, inside the app's context, since a link sends
// Later — a batch after a tick — when that context is gone
export const getLinkFetch = (): TRPCFetch => {
  if (checkIsServer()) {
    const event = useRequestEvent();
    if (event) return event.fetch;
  }
  return (input, init) => fetch(new URL(input, window.location.href), init);
};
