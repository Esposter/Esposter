import type { TRPCRouter } from "@@/server/trpc/routers";
import type { TRPCLink } from "@trpc/client";

import { transformer } from "#shared/services/trpc/transformer";
import { IS_PRODUCTION, IS_TEST } from "#shared/util/environment/constants";
import { TRPC_CLIENT_PATH, TRPC_WS_PATH } from "@/services/trpc/constants";
import { errorLink } from "@/services/trpc/errorLink";
import { createOfflineLink } from "@/services/trpc/offlineLink";
import { checkIsServer } from "@esposter/shared";
import {
  createWSClient,
  isNonJsonSerializable,
  loggerLink,
  splitLink,
  httpLink as trpcHttpLink,
  wsLink,
} from "@trpc/client";
import { createTRPCNuxtClient, httpBatchLink, httpLink } from "trpc-nuxt/client";

export default defineNuxtPlugin(() => {
  const online = useOnline();
  const links: TRPCLink<TRPCRouter>[] = [
    loggerLink({
      enabled: (opts) =>
        (!IS_PRODUCTION && !checkIsServer()) || (opts.direction === "down" && opts.result instanceof Error),
    }),
    ...(checkIsServer() ? [] : [createOfflineLink(online)]),
    errorLink,
  ];
  // Under test the client talks to the network so a test can answer it there, exercising the real links and
  // Transformer rather than a stand-in client. Two things have to give way for that: trpc-nuxt's links wrap
  // Nuxt's `$fetch`, which resolves internally and never reaches an interceptor, and batching puts several
  // Procedures behind one url that no per-procedure handler can match. Both are transport concerns, so
  // Nothing a test asserts on changes — but the url must be absolute, since node's fetch cannot take a path.
  // Client-side only for that reason: the origin is read while the link is built, which is ahead of the server
  // Branch below deciding whether this link is used at all, so a test loading this plugin without a dom would
  // Fail on `window is not defined` — an error naming nothing about tRPC
  const httpSplitLink =
    IS_TEST && !checkIsServer()
      ? trpcHttpLink({ transformer, url: `${window.location.origin}${TRPC_CLIENT_PATH}` })
      : splitLink({
          condition: ({ input }) => isNonJsonSerializable(input),
          false: httpBatchLink({ transformer, url: TRPC_CLIENT_PATH }),
          true: httpLink({ transformer, url: TRPC_CLIENT_PATH }),
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
