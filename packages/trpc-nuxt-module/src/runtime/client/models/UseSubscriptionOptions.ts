import type { SubscriptionResolver, TRPCResolverDef } from "@trpc/client";
import type { MaybeRefOrGetter } from "vue";

// The observer and per-call options `subscribe` takes, plus whether the subscription should be open at all
export type UseSubscriptionOptions<TDefinition extends TRPCResolverDef> = Parameters<
  SubscriptionResolver<TDefinition>
>[1] & { enabled?: MaybeRefOrGetter<boolean> };
