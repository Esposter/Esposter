import type { TrpcRouter } from "@/server/trpc/routers";
import type { TRPCLink } from "@trpc/client";

import { SuperJSON } from "@/services/superjson";
import { errorLink } from "@/services/trpc/errorLink";
import { IS_DEVELOPMENT } from "@/util/environment/constants";
import { getIsServer } from "@/util/environment/getIsServer";
import { createWSClient, loggerLink, splitLink, wsLink } from "@trpc/client";
import { createTRPCNuxtClient, httpBatchLink } from "trpc-nuxt/client";

export default defineNuxtPlugin(() => {
  const url = useClientUrl();
  const headers = useRequestHeaders();
  const links: TRPCLink<TrpcRouter>[] = [
    // Log to your console in development and only log errors in production
    loggerLink({
      enabled: (opts) =>
        (IS_DEVELOPMENT && !getIsServer()) || (opts.direction === "down" && opts.result instanceof Error),
    }),
    errorLink,
    splitLink({
      condition: (op) => op.type === "subscription",
      false: httpBatchLink({ headers, url }),
      true: (() => {
        if (getIsServer()) return httpBatchLink({ headers, url });

        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsClient = createWSClient({ url: `${wsProtocol}//${window.location.host}` });
        return wsLink({ client: wsClient });
      })(),
    }),
  ];
  const client = createTRPCNuxtClient<TrpcRouter>({ links, transformer: SuperJSON });
  return { provide: { client } };
});
