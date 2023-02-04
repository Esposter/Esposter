import type { AppRouter } from "@/server/trpc/routers";
import type { TRPCLink } from "@trpc/client";
import { createTRPCProxyClient, createWSClient, httpBatchLink, loggerLink, splitLink, wsLink } from "@trpc/client";
import superjson from "superjson";

export default defineNuxtPlugin(() => {
  const url = useTRPCClientUrl();
  // Grab auth cookie to pass to server
  const headers = useRequestHeaders(["cookie"]);
  const links: TRPCLink<AppRouter>[] = [
    // Log to your console in development and only log errors in production
    loggerLink({
      enabled: (opts) => (isDevelopment && !isServer()) || (opts.direction === "down" && opts.result instanceof Error),
    }),
    splitLink({
      condition: (op) => op.type === "subscription",
      true: (() => {
        if (isServer()) return httpBatchLink({ url, headers });

        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsClient = createWSClient({ url: `${wsProtocol}//${window.location.host}` });
        return wsLink({ client: wsClient });
      })(),
      false: httpBatchLink({ url, headers }),
    }),
  ];

  const client = createTRPCProxyClient<AppRouter>({ links, transformer: superjson });
  return { provide: { client } };
});
