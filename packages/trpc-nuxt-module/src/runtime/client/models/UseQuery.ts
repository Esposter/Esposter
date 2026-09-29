import type { KeysOf } from "#src/runtime/client/models/KeysOf";
import type { QueryAsyncData } from "#src/runtime/client/models/QueryAsyncData";
import type { UseQueryOptions } from "#src/runtime/client/models/UseQueryOptions";
import type { TRPCResolverDef } from "@trpc/client";
import type { MaybeRefOrGetter } from "vue";

// A ref or a getter as input is watched: the key follows it, so a changed input is fetched and cached apart
export type UseQuery<TDefinition extends TRPCResolverDef> = <
  TData = TDefinition["output"],
  TPickKeys extends KeysOf<TData> = KeysOf<TData>,
  TDefault = undefined,
>(
  input: MaybeRefOrGetter<TDefinition["input"]>,
  options?: UseQueryOptions<TDefinition, TData, TPickKeys, TDefault>,
) => QueryAsyncData<TDefinition, TData, TPickKeys, TDefault>;
