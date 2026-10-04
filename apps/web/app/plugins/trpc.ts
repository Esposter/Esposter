import type { TRPCRouter } from "#server/trpc/routers";
import type { TRPCLink } from "@trpc/client";

import { transformer } from "#shared/services/trpc/transformer";
import { IS_PRODUCTION } from "#shared/util/environment/constants";
import { TRPC_CLIENT_PATH, TRPC_WS_PATH } from "@/services/trpc/constants";
import { createOfflineLink } from "@/services/trpc/createOfflineLink";
import { errorLink } from "@/services/trpc/errorLink";
import { checkIsServer } from "@esposter/shared";
import { createWSClient, isNonJsonSerializable, loggerLink, splitLink, wsLink } from "@trpc/client";

export default defineNuxtPlugin(() => {
  const online = useOnline();
  const links: TRPCLink<TRPCRouter>[] = [
    loggerLink({
      enabled: (options) =>
        (!IS_PRODUCTION && !checkIsServer()) || (options.direction === "down" && options.result instanceof Error),
    }),
    ...(checkIsServer() ? [] : [createOfflineLink(online)]),
    errorLink,
  ];
  const httpSplitLink = splitLink({
    condition: ({ input }) => isNonJsonSerializable(input),
    false: httpBatchLink<TRPCRouter>({ transformer, url: TRPC_CLIENT_PATH }),
    true: httpLink<TRPCRouter>({ transformer, url: TRPC_CLIENT_PATH }),
  });

  if (checkIsServer()) links.push(httpSplitLink);
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
