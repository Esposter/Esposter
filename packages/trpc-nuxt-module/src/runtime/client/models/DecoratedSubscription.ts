import type { UseSubscriptionOptions } from "#src/runtime/client/models/UseSubscriptionOptions";
import type { UseSubscriptionReturn } from "#src/runtime/client/models/UseSubscriptionReturn";
import type { SubscriptionResolver, TRPCClientError, TRPCResolverDef } from "@trpc/client";
import type { MaybeRefOrGetter } from "vue";

export interface DecoratedSubscription<TDefinition extends TRPCResolverDef> {
  subscribe: SubscriptionResolver<TDefinition>;
  useSubscription: (
    input: MaybeRefOrGetter<TDefinition["input"]>,
    options?: UseSubscriptionOptions<TDefinition>,
  ) => UseSubscriptionReturn<
    Parameters<NonNullable<UseSubscriptionOptions<TDefinition>["onData"]>>[0],
    TRPCClientError<TDefinition>
  >;
}
