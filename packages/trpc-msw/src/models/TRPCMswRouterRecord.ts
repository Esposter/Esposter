import type { ProcedureResolver } from "#src/models/ProcedureResolver";
import type { AnyTRPCProcedure, TRPCRouterRecord } from "@trpc/server";

export type TRPCMswRouterRecord<TContext, TRecord extends TRPCRouterRecord> = {
  readonly [TKey in keyof TRecord]: TRecord[TKey] extends AnyTRPCProcedure
    ? Readonly<Record<TRecord[TKey]["_def"]["type"], (resolver: ProcedureResolver<TContext, TRecord[TKey]>) => void>>
    : TRecord[TKey] extends TRPCRouterRecord
      ? TRPCMswRouterRecord<TContext, TRecord[TKey]>
      : never;
};
