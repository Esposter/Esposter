import type { HTTPLinkOptions, TRPCLink } from "@trpc/client";
import type { AnyTRPCRouter } from "@trpc/server";

import { getLinkFetch } from "#src/runtime/client/services/getLinkFetch";
import { httpLink as baseHttpLink } from "@trpc/client";

// TRPC's `httpLink`, sending through the request event during server rendering unless given a `fetch` of its own
export const httpLink = <TRouter extends AnyTRPCRouter>(
  options: HTTPLinkOptions<TRouter["_def"]["_config"]["$types"]>,
): TRPCLink<TRouter> => baseHttpLink({ fetch: getLinkFetch(), ...options });
