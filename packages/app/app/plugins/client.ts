import type { TRPCRouter } from "@@/server/trpc/routers";
import type { TRPCLink } from "@trpc/client";

import { transformer } from "#shared/services/trpc/transformer";
import { IS_DEVELOPMENT } from "#shared/util/environment/constants";
import { getIsServer } from "#shared/util/environment/getIsServer";
import { errorLink } from "@/services/trpc/errorLink";
import { createWSClient, loggerLink, splitLink, wsLink } from "@trpc/client";
import { createTRPCNuxtClient, httpBatchLink } from "trpc-nuxt/client";

export default defineNuxtPlugin(() => {
  const url = useClientUrl();
  const headers = useRequestHeaders();
  const links: TRPCLink<TRPCRouter>[] = [
    // Log to your console in development and only log errors in production
    loggerLink({
      enabled: (opts) =>
        (IS_DEVELOPMENT && !getIsServer()) || (opts.direction === "down" && opts.result instanceof Error),
    }),
    errorLink,
    splitLink({
      condition: (op) => op.type === "subscription",
      false: httpBatchLink({ headers, transformer, url }),
      true: (() => {
        if (getIsServer()) return httpBatchLink({ headers, transformer, url });

        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsClient = createWSClient({ url: `${wsProtocol}//${window.location.host}` });
        return wsLink({ client: wsClient, transformer });
      })(),
    }),
  ];
  const client = createTRPCNuxtClient<TRPCRouter>({ links });
  return { provide: { client } };
});
