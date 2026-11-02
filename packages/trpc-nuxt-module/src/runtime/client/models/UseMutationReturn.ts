import type { KeysOf } from "#src/runtime/client/models/KeysOf";
import type { PickFrom } from "#src/runtime/client/models/PickFrom";
import type { QueryAsyncData } from "#src/runtime/client/models/QueryAsyncData";
import type { TRPCResolverDef } from "@trpc/client";

export type UseMutationReturn<
  TDefinition extends TRPCResolverDef,
  TData,
  TPickKeys extends KeysOf<TData>,
  TDefault,
> = QueryAsyncData<TDefinition, TData, TPickKeys, TDefault> & {
  // Resolves with the data its own call's mutation produced, and rejects with the error that call failed with, wrapped as the `error` ref wraps one
  mutate: (input: TDefinition["input"]) => Promise<PickFrom<TData, TPickKeys> | TDefault>;
};
