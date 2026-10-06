import type { CreateContextOptions } from "#src/models/CreateContextOptions";
import type { TRPCMswRoot } from "#src/models/TRPCMswRoot";
import type { UnhandledProcedureAction } from "#src/models/UnhandledProcedureAction";
import type { AnyTRPCRouter } from "@trpc/server";
import type { Promisable } from "type-fest";

export interface TRPCMswOptions<TContext extends object> {
  // A query sent as a POST, as `httpLink` and `httpBatchLink` do with `methodOverride: "POST"`
  allowMethodOverride?: boolean;
  createContext?: (options: CreateContextOptions) => Promisable<TContext>;
  // The url the client's http links point at, matched as msw matches any request url
  endpoint: string;
  onUnhandledProcedure?: UnhandledProcedureAction;
  // The real router, whose procedures' input parsers run before each resolver, so a call the server would reject
  // With BAD_REQUEST is rejected here too rather than answered. Without it any input reaches the resolver
  router?: AnyTRPCRouter;
  t: TRPCMswRoot<TContext>;
  // The url the client's `wsLink` connects to; no WebSocket handler is created without it
  webSocketUrl?: string;
}
