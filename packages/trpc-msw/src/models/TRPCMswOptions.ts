import type { CreateContextOptions } from "#src/models/CreateContextOptions";
import type { TRPCMswRoot } from "#src/models/TRPCMswRoot";
import type { UnhandledProcedureAction } from "#src/models/UnhandledProcedureAction";
import type { Promisable } from "type-fest";

export interface TRPCMswOptions<TContext extends object> {
  // A query sent as a POST, as `httpLink` and `httpBatchLink` do with `methodOverride: "POST"`
  allowMethodOverride?: boolean;
  createContext?: (options: CreateContextOptions) => Promisable<TContext>;
  // The url the client's http links point at, matched as msw matches any request url
  endpoint: string;
  onUnhandledProcedure?: UnhandledProcedureAction;
  t: TRPCMswRoot<TContext>;
  // The url the client's `wsLink` connects to; no WebSocket handler is created without it
  webSocketUrl?: string;
}
