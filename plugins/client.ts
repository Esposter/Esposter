import type { AppRouter } from "@/server/trpc/routers";
import { errorLink } from "@/services/trpc/errorLink";
import type { TRPCLink } from "@trpc/client";
import { createWSClient, loggerLink, splitLink, wsLink } from "@trpc/client";
import SuperJSON from "superjson";
import { createTRPCNuxtClient, httpBatchLink } from "trpc-nuxt/client";

export default defineNuxtPlugin(() => {
  const url = useClientUrl();
  const links: TRPCLink<AppRouter>[] = [
    // Log to your console in development and only log errors in production
    loggerLink({
      enabled: (opts) => (isDevelopment && !isServer()) || (opts.direction === "down" && opts.result instanceof Error),
    }),
    errorLink,
    splitLink({
      condition: (op) => op.type === "subscription",
      true: (() => {
        if (isServer()) return httpBatchLink({ url });

        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsClient = createWSClient({ url: `${wsProtocol}//${window.location.host}` });
        return wsLink({ client: wsClient });
      })(),
      false: httpBatchLink({ url }),
    }),
  ];
  const client = createTRPCNuxtClient<AppRouter>({ links, transformer: SuperJSON });
  return { provide: { client } };
});
