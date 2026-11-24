import type { SubscriptionResolver, TRPCResolverDef } from "@trpc/client";
import type { MaybeRefOrGetter } from "vue";

// The observer and per-call options `subscribe` takes with callbacks, which is the first of its two overloads.
// The second is the one without callbacks, and a parameter list is read from the last.
// It also covers whether the subscription should be open at all.
export type UseSubscriptionOptions<TDefinition extends TRPCResolverDef> =
  SubscriptionResolver<TDefinition> extends {
    (input: TDefinition["input"], opts: infer TOptions): unknown;
    // `tRPC's` subscribe is overloaded and exports no type for its callbacks overload.
    // A single signature reads the last overload, so the pattern names both.
    // oxlint-disable-next-line selector-ban/no-restricted-syntax -- the signature reads the last overload
    (...args: never[]): unknown;
  }
    ? { enabled?: MaybeRefOrGetter<boolean> } & Partial<TOptions>
    : never;
