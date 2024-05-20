import type { TrpcRouter } from "@/server/trpc/routers";
import { superjson } from "@/services/superjson";
import { errorLink } from "@/services/trpc/errorLink";
import { IS_DEVELOPMENT } from "@/util/environment/constants";
import { getIsServer } from "@/util/environment/getIsServer";
import type { TRPCLink } from "@trpc/client";
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
      true: (() => {
        if (getIsServer()) return httpBatchLink({ url, headers });

        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsClient = createWSClient({ url: `${wsProtocol}//${window.location.host}` });
        return wsLink({ client: wsClient });
      })(),
      false: httpBatchLink({ url, headers }),
    }),
  ];
  const client = createTRPCNuxtClient<TrpcRouter>({ links, transformer: superjson });
  return { provide: { client } };
});
