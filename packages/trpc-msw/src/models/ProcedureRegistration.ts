import type { ProcedureResolverOptions } from "#src/models/ProcedureResolverOptions";
import type { SubscriptionRegistration } from "#src/models/SubscriptionRegistration";
import type { TRPCProcedureType } from "@trpc/server";

export type ProcedureRegistration =
  | SubscriptionRegistration
  | {
      resolver: (options: ProcedureResolverOptions<unknown, unknown>) => unknown;
      type: Exclude<TRPCProcedureType, "subscription">;
    };
