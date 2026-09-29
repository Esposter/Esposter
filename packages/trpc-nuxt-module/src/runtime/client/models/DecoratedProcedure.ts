import type { DecoratedMutation } from "#src/runtime/client/models/DecoratedMutation";
import type { DecoratedQuery } from "#src/runtime/client/models/DecoratedQuery";
import type { DecoratedSubscription } from "#src/runtime/client/models/DecoratedSubscription";
import type { TRPCResolverDef } from "@trpc/client";
import type { TRPCProcedureType } from "@trpc/server";

export type DecoratedProcedure<
  TType extends TRPCProcedureType,
  TDefinition extends TRPCResolverDef,
> = TType extends "query"
  ? DecoratedQuery<TDefinition>
  : TType extends "mutation"
    ? DecoratedMutation<TDefinition>
    : DecoratedSubscription<TDefinition>;
