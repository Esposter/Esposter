import type { ProcedureResolverOptions } from "#src/models/ProcedureResolverOptions";
import type { Promisable } from "type-fest";

export interface SubscriptionRegistration {
  resolver: (options: ProcedureResolverOptions<unknown, unknown>) => Promisable<AsyncIterable<unknown>>;
  type: "subscription";
}
