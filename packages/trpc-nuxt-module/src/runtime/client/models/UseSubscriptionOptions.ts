import type { SubscriptionResolver, TRPCResolverDef } from "@trpc/client";
import type { MaybeRefOrGetter } from "vue";

// The observer and per-call options `subscribe` takes with callbacks, which is the first of its two overloads (the second
// Is the one without callbacks, and a parameter list is read from the last), plus whether the subscription should be open
// At all
export type UseSubscriptionOptions<TDefinition extends TRPCResolverDef> =
  SubscriptionResolver<TDefinition> extends {
    (input: TDefinition["input"], opts: infer TOptions): unknown;
    // oxlint-disable-next-line selector-ban/no-restricted-syntax -- tRPC's subscribe is overloaded and exports no type for its callbacks overload, and a single signature reads the last overload, so the pattern names both
    (...args: never[]): unknown;
  }
    ? Partial<TOptions> & { enabled?: MaybeRefOrGetter<boolean> }
    : never;
