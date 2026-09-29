import type { TRPCEventHandlerOptions } from "#src/runtime/server/models/TRPCEventHandlerOptions";
import type { AnyTRPCRouter } from "@trpc/server";
import type { FetchCreateContextFnOptions, FetchHandlerRequestOptions } from "@trpc/server/adapters/fetch";
import type { EventHandler, EventHandlerRequest } from "h3";

import { DEFAULT_ENDPOINT } from "#src/runtime/constants";
import { toRequest } from "#src/runtime/server/services/toRequest";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { defineEventHandler } from "h3";

export const createTRPCEventHandler = <TRouter extends AnyTRPCRouter>({
  createContext,
  endpoint = DEFAULT_ENDPOINT,
  ...options
}: TRPCEventHandlerOptions<TRouter>): EventHandler<EventHandlerRequest, Promise<Response | undefined>> =>
  defineEventHandler(async (event) => {
    const response = await fetchRequestHandler({
      ...options,
      createContext:
        createContext &&
        ((fetchCreateContextOptions: FetchCreateContextFnOptions) => createContext(event, fetchCreateContextOptions)),
      endpoint,
      req: await toRequest(event),
      // Whether tRPC demands a context callback is a conditional type over the router's context, which never resolves
      // While `TRouter` is open; the caller's options were checked against its own router at the call site
    } as unknown as FetchHandlerRequestOptions<TRouter>);
    // A procedure that answered through the event itself — a redirect, a stream — has already sent its response
    if (event.handled) return undefined;
    return response;
  });
