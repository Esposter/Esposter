import type { TRPCEventHandlerOptions } from "#src/runtime/server/models/TRPCEventHandlerOptions";
import type { AnyTRPCRouter } from "@trpc/server";
import type { FetchCreateContextFnOptions, FetchHandlerRequestOptions } from "@trpc/server/adapters/fetch";
import type { EventHandler } from "nitro/h3";

import { DEFAULT_ENDPOINT } from "#src/runtime/constants";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { defineHandler } from "nitro/h3";

// The statuses a `Response` may be constructed with that forbid a body, which its constructor throws on
const NULL_BODY_STATUSES = new Set([204, 205, 304]);

export const createTRPCEventHandler = <TRouter extends AnyTRPCRouter>({
  createContext,
  endpoint = DEFAULT_ENDPOINT,
  ...options
}: TRPCEventHandlerOptions<TRouter>): EventHandler =>
  defineHandler(async (event) => {
    const response = await fetchRequestHandler({
      ...options,
      createContext:
        createContext &&
        ((fetchCreateContextOptions: FetchCreateContextFnOptions) => createContext(event, fetchCreateContextOptions)),
      endpoint,
      // The request h3 holds, whose signal aborts when the response closes before it finished — the client going away
      req: event.req,
      // Whether tRPC demands a context callback is a conditional type over the router's context, which never resolves
      // While `TRouter` is open; the caller's options were checked against its own router at the call site
    } as FetchHandlerRequestOptions<TRouter>);
    // H3 merges the headers a procedure set through the event into the response, but not a status, so one a procedure
    // Answered with itself — a redirect — replaces tRPC's
    const { status } = event.res;
    return status
      ? new Response(NULL_BODY_STATUSES.has(status) ? null : response.body, { headers: response.headers, status })
      : response;
  });
