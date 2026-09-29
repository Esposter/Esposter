import type { ProcedureResolverOptions } from "#src/models/ProcedureResolverOptions";
import type { AnyTRPCProcedure, inferProcedureInput, inferProcedureOutput } from "@trpc/server";
import type { Promisable } from "type-fest";

// The output is the procedure's own, before the transformer: the transformer runs on the way out exactly as it
// Does on the real server, so a resolver returns a `Date` rather than its serialized envelope
export type ProcedureResolver<TContext, TProcedure extends AnyTRPCProcedure> = (
  options: ProcedureResolverOptions<TContext, inferProcedureInput<TProcedure>>,
) => Promisable<inferProcedureOutput<TProcedure>>;
