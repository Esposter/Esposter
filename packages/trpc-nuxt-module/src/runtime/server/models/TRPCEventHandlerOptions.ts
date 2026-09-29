import type { AnyTRPCRouter, inferRouterContext } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { HTTPBaseHandlerOptions } from "@trpc/server/http";
import type { H3Event } from "h3";
import type { Promisable } from "type-fest";

// TRPC's own handler options, with a context factory handed the event, typed on h3's own `H3Event` so Nitro's
// Augmentation of it reaches whatever the context reads. Built on the base options rather than on the fetch adapter's,
// Whose context callback is a conditional type an inferred router cannot see through
export type TRPCEventHandlerOptions<TRouter extends AnyTRPCRouter> = HTTPBaseHandlerOptions<TRouter, Request> & {
  createContext?: (event: H3Event, options: FetchCreateContextFnOptions) => Promisable<inferRouterContext<TRouter>>;
  endpoint?: string;
};
