import type { HTTPBatchLinkOptions, TRPCLink } from "@trpc/client";
import type { AnyTRPCRouter } from "@trpc/server";

import { getLinkFetch } from "#src/runtime/client/services/getLinkFetch";
import { httpBatchLink as baseHttpBatchLink } from "@trpc/client";

// TRPC's `httpBatchLink`, sending through the request event during server rendering unless given a `fetch` of its own
export const httpBatchLink = <TRouter extends AnyTRPCRouter>(
  options: HTTPBatchLinkOptions<TRouter["_def"]["_config"]["$types"]>,
): TRPCLink<TRouter> => baseHttpBatchLink({ fetch: getLinkFetch(), ...options });
