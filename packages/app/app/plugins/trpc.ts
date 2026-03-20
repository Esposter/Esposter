import type { TRPCRouter } from "@@/server/trpc/routers";
import type { TRPCLink } from "@trpc/client";

import { TRPC_WS_PATH } from "#shared/services/trpc/constants";
import { transformer } from "#shared/services/trpc/transformer";
import { TRPC_CLIENT_PATH } from "@/services/trpc/constants";
import { errorLink } from "@/services/trpc/errorLink";
import { TRPCOfflineClientError } from "@/models/trpc/TRPCOfflineClientError";
import { createOfflineLink } from "@/services/trpc/offlineLink";
import { getIsServer } from "@esposter/shared";
import { createWSClient, isNonJsonSerializable, loggerLink, splitLink, wsLink } from "@trpc/client";
import { createTRPCNuxtClient, httpBatchLink, httpLink } from "trpc-nuxt/client";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("vue:error", (error) => {
    if (error instanceof TRPCOfflineClientError) return;
  });
  if (!getIsServer())
    window.addEventListener("unhandledrejection", (event) => {
      if (event.reason instanceof TRPCOfflineClientError) event.preventDefault();
    });

  const isProduction = useIsProduction();
  const online = useOnline();
  const links: TRPCLink<TRPCRouter>[] = [
    // Log to your console in development and only log errors in production
    loggerLink({
      enabled: (opts) =>
        (!isProduction && !getIsServer()) || (opts.direction === "down" && opts.result instanceof Error),
    }),
    ...(getIsServer() ? [] : [createOfflineLink(online)]),
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
    const wsClient = createWSClient({ url: `${wsProtocol}//${window.location.host}${TRPC_WS_PATH}` });
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
