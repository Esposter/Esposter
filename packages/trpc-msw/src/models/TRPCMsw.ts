import type { TRPCMswRouterRecord } from "#src/models/TRPCMswRouterRecord";
import type { AnyTRPCRouter } from "@trpc/server";
import type { HttpHandler, WebSocketHandler } from "msw";

export interface TRPCMsw<TRouter extends AnyTRPCRouter, TContext> {
  // Handed to `setupServer` or `setupWorker`
  handlers: (HttpHandler | WebSocketHandler)[];
  // Forgets every resolver registered so far, for an `afterEach`
  reset: () => void;
  trpc: TRPCMswRouterRecord<TContext, TRouter["_def"]["record"]>;
}
