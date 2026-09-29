import type { ProcedureNode } from "#src/runtime/client/models/ProcedureNode";
import type { UseQuery } from "#src/runtime/client/models/UseQuery";
import type { Resolver, TRPCResolverDef } from "@trpc/client";

export interface DecoratedQuery<TDefinition extends TRPCResolverDef> extends ProcedureNode {
  query: Resolver<TDefinition>;
  useLazyQuery: UseQuery<TDefinition>;
  useQuery: UseQuery<TDefinition>;
}
