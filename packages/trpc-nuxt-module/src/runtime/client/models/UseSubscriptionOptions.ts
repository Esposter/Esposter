import type { SubscriptionResolver, TRPCResolverDef } from "@trpc/client";
import type { MaybeRefOrGetter } from "vue";

// The observer and per-call options `subscribe` takes with callbacks, which is the first of its two overloads (the second
// Is the one without callbacks, and a parameter list is read from the last), plus whether the subscription should be open
// At all
export type UseSubscriptionOptions<TDefinition extends TRPCResolverDef> =
  SubscriptionResolver<TDefinition> extends {
    (input: TDefinition["input"], opts: infer TOptions): unknown;
    (...args: never[]): unknown;
  }
    ? Partial<TOptions> & { enabled?: MaybeRefOrGetter<boolean> }
    : never;
