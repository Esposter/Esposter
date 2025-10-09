import type { TRPCRouter } from "@@/server/trpc/routers";
import type { TRPCLink } from "@trpc/client";

import { transformer } from "#shared/services/trpc/transformer";
import { IS_DEVELOPMENT } from "#shared/util/environment/constants";
import { TRPC_CLIENT_PATH } from "@/services/trpc/constants";
import { errorLink } from "@/services/trpc/errorLink";
import { getIsServer } from "@esposter/shared";
import { createWSClient, isNonJsonSerializable, loggerLink, splitLink, wsLink } from "@trpc/client";
import { createTRPCNuxtClient, httpBatchLink, httpLink } from "trpc-nuxt/client";

export default defineNuxtPlugin(() => {
  const links: TRPCLink<TRPCRouter>[] = [
    // Log to your console in development and only log errors in production
    loggerLink({
      enabled: (opts) =>
        (IS_DEVELOPMENT && !getIsServer()) || (opts.direction === "down" && opts.result instanceof Error),
    }),
    errorLink,
  ];
  const httpSplitLink = splitLink({
    condition: ({ input }) => isNonJsonSerializable(input),
    false: httpBatchLink({ transformer, url: TRPC_CLIENT_PATH }),
    true: httpLink({ transformer, url: TRPC_CLIENT_PATH }),
  });

  if (getIsServer()) links.push(httpSplitLink);
  else {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsClient = createWSClient({ url: `${wsProtocol}//${window.location.host}` });
    links.push(
      splitLink({
        condition: ({ type }) => type === "subscription",
        false: httpSplitLink,
        true: wsLink({ client: wsClient, transformer }),
      }),
    );
  }

  const trpc = createTRPCNuxtClient<TRPCRouter>({ links });
  return { provide: { trpc } };
});
