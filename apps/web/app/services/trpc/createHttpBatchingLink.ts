import type { TRPCRouter } from "#server/trpc/routers";
import type { TRPCLink } from "@trpc/client";

import { transformer } from "#shared/services/trpc/transformer";
import { TRPC_CLIENT_PATH } from "@/services/trpc/constants";

// Production batches the calls sent in one tick into one request. The test build sends each call as its own request,
// Because a batch is answered as one response: a read a test holds open would hold every read sent with it in that tick
export const createHttpBatchingLink = (isTest: boolean): TRPCLink<TRPCRouter> =>
  isTest
    ? httpLink<TRPCRouter>({ transformer, url: TRPC_CLIENT_PATH })
    : httpBatchLink<TRPCRouter>({ transformer, url: TRPC_CLIENT_PATH });
