import type { TRPCRouter } from "@@/server/trpc/routers";
import type { TRPCLink } from "@trpc/client";

import { transformer } from "#shared/services/trpc/transformer";
import { IS_DEVELOPMENT } from "#shared/util/environment/constants";
import { getIsServer } from "#shared/util/environment/getIsServer";
import { TRPC_CLIENT_PATH } from "@/services/trpc/constants";
import { errorLink } from "@/services/trpc/errorLink";
import { createWSClient, loggerLink, splitLink, wsLink } from "@trpc/client";
import { createTRPCNuxtClient, httpBatchLink } from "trpc-nuxt/client";

export default defineNuxtPlugin(() => {
  const links: TRPCLink<TRPCRouter>[] = [
    // Log to your console in development and only log errors in production
    loggerLink({
      enabled: (opts) =>
        (IS_DEVELOPMENT && !getIsServer()) || (opts.direction === "down" && opts.result instanceof Error),
    }),
    errorLink,
    splitLink({
      condition: (op) => op.type === "subscription",
      false: httpBatchLink({ transformer, url: TRPC_CLIENT_PATH }),
      true: (() => {
        if (getIsServer()) return httpBatchLink({ transformer, url: TRPC_CLIENT_PATH });

        const headers = useRequestHeaders();
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsClient = createWSClient({
          connectionParams: () => headers,
          url: `${wsProtocol}//${window.location.host}`,
        });
        return wsLink({ client: wsClient, transformer });
      })(),
    }),
  ];
  const trpc = createTRPCNuxtClient<TRPCRouter>({ links });
  return { provide: { trpc } };
});
