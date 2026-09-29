import type { KeysOf } from "#src/runtime/client/models/KeysOf";
import type { ProcedureNode } from "#src/runtime/client/models/ProcedureNode";
import type { UseMutationOptions } from "#src/runtime/client/models/UseMutationOptions";
import type { UseMutationReturn } from "#src/runtime/client/models/UseMutationReturn";
import type { Resolver, TRPCResolverDef } from "@trpc/client";

export interface DecoratedMutation<TDefinition extends TRPCResolverDef> extends ProcedureNode {
  mutate: Resolver<TDefinition>;
  useMutation: <TData = TDefinition["output"], TPickKeys extends KeysOf<TData> = KeysOf<TData>, TDefault = undefined>(
    options?: UseMutationOptions<TDefinition, TData, TPickKeys, TDefault>,
  ) => UseMutationReturn<TDefinition, TData, TPickKeys, TDefault>;
}
