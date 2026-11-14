import type { TRPCRouter } from "#server/trpc/routers";
import type { TRPCLink } from "@trpc/client";

import { transformer } from "#shared/services/trpc/transformer";
import { IS_PRODUCTION, IS_TEST } from "#shared/util/environment/constants";
import { TRPC_CLIENT_PATH } from "@/services/trpc/constants";
import { createHttpBatchingLink } from "@/services/trpc/createHttpBatchingLink";
import { createOfflineLink } from "@/services/trpc/createOfflineLink";
import { errorLink } from "@/services/trpc/errorLink";
import { getTrpcHeaders } from "@/services/trpc/getTrpcHeaders";
import { checkIsServer } from "@esposter/shared";
import { isNonJsonSerializable, loggerLink, splitLink } from "@trpc/client";

export default defineNuxtPlugin(() => {
  const online = useOnline();
  const links: TRPCLink<TRPCRouter>[] = [
    loggerLink({
      enabled: (options) =>
        (!IS_PRODUCTION && !checkIsServer()) || (options.direction === "down" && options.result instanceof Error),
    }),
    createOfflineLink(online),
    errorLink,
    splitLink({
      condition: ({ input }) => isNonJsonSerializable(input),
      false: createHttpBatchingLink(IS_TEST),
      true: httpLink<TRPCRouter>({ headers: getTrpcHeaders, transformer, url: TRPC_CLIENT_PATH }),
    }),
  ];
  const trpc = createTRPCNuxtClient<TRPCRouter>({ links });
  return { provide: { trpc } };
});
