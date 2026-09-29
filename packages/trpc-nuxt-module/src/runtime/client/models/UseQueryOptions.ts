import type { KeysOf } from "#src/runtime/client/models/KeysOf";
import type { TRPCRequestOptions, TRPCResolverDef } from "@trpc/client";
import type { AsyncDataOptions } from "nuxt/app";
import type { Except } from "type-fest";

// Everything `useAsyncData` takes, plus a key to cache under in place of the one derived from the path and the input,
// And tRPC's own per-call options. `watch: false` is what `useAsyncData` does at runtime and leaves out of its type:
// Nothing is watched, so with `immediate: false` the query runs only when told to
export type UseQueryOptions<
  TDefinition extends TRPCResolverDef,
  TData = TDefinition["output"],
  TPickKeys extends KeysOf<TData> = KeysOf<TData>,
  TDefault = undefined,
> = Except<AsyncDataOptions<TDefinition["output"], TData, TPickKeys, TDefault>, "watch"> & {
  queryKey?: string;
  trpc?: TRPCRequestOptions;
  watch?: false | NonNullable<AsyncDataOptions<TDefinition["output"], TData, TPickKeys, TDefault>["watch"]>;
};
