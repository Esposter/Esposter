import type { SubscriptionResolver, TRPCResolverDef } from "@trpc/client";
import type { MaybeRefOrGetter } from "vue";

// The observer and per-call options `subscribe` takes with callbacks, which is the first of its two overloads (the
// Second Is the one without callbacks, and a parameter list is read from the last), plus whether the subscription
// Should be open At all
export type UseSubscriptionOptions<TDefinition extends TRPCResolverDef> =
  SubscriptionResolver<TDefinition> extends {
    (input: TDefinition["input"], opts: infer TOptions): unknown;
    // `tRPC's` subscribe is overloaded and exports no type for its callbacks overload, and a single signature
    // oxlint-disable-next-line selector-ban/no-restricted-syntax -- reads the last overload, so the pattern names both
    (...args: never[]): unknown;
  }
    ? { enabled?: MaybeRefOrGetter<boolean> } & Partial<TOptions>
    : never;
