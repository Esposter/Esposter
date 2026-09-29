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
  // Resolves with the data the mutation produced, and rejects with the error its `error` ref now holds
  mutate: (input: TDefinition["input"]) => Promise<PickFrom<TData, TPickKeys> | TDefault>;
};
