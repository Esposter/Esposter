import type { TRPCRouter } from "#server/trpc/routers/index";
import type { TRPCLink } from "@trpc/client";

import { transformer } from "#shared/services/trpc/transformer";
import { IS_PRODUCTION, IS_TEST } from "#shared/util/environment/constants";
import { TRPC_CLIENT_PATH } from "#src/services/trpc/constants";
import { createHttpBatchingLink } from "#src/services/trpc/createHttpBatchingLink";
import { createOfflineLink } from "#src/services/trpc/createOfflineLink";
import { errorLink } from "#src/services/trpc/errorLink";
import { getTrpcHeaders } from "#src/services/trpc/getTrpcHeaders";
import { topicsLink } from "#src/services/trpc/topicsLink";
import { checkIsServer } from "@esposter/shared";
import { isNonJsonSerializable, loggerLink, splitLink } from "@trpc/client";

export default defineNuxtPlugin(() => {
  const online = useOnline();
  const links: TRPCLink<TRPCRouter>[] = [
    topicsLink,
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
