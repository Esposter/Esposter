import type { DecoratedProcedure } from "#src/runtime/client/models/DecoratedProcedure";
import type { ProcedureNode } from "#src/runtime/client/models/ProcedureNode";
import type {
  AnyTRPCProcedure,
  AnyTRPCRootTypes,
  inferProcedureInput,
  inferTransformedProcedureOutput,
  TRPCRouterRecord,
} from "@trpc/server";

// The router walked with tRPC's public inference helpers only, one procedure at a time
export type DecoratedRouterRecord<TRoot extends AnyTRPCRootTypes, TRecord extends TRPCRouterRecord> = ProcedureNode & {
  readonly [TKey in keyof TRecord]: TRecord[TKey] extends AnyTRPCProcedure
    ? DecoratedProcedure<
        TRecord[TKey]["_def"]["type"],
        {
          errorShape: TRoot["errorShape"];
          input: inferProcedureInput<TRecord[TKey]>;
          output: inferTransformedProcedureOutput<TRoot, TRecord[TKey]>;
          transformer: TRoot["transformer"];
        }
      >
    : TRecord[TKey] extends TRPCRouterRecord
      ? DecoratedRouterRecord<TRoot, TRecord[TKey]>
      : never;
};
