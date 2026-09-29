import type { AnyTRPCRootTypes, TRPCRootObject, TRPCRouterBuilder } from "@trpc/server";

// The mock router is built on the consumer's own `initTRPC` result, so its transformer and error formatter are
// The ones the real server answers with rather than a re-implementation of either
export interface TRPCMswRoot<TContext extends object> {
  procedure: TRPCRootObject<TContext, object, object>["procedure"];
  router: TRPCRouterBuilder<AnyTRPCRootTypes>;
}
