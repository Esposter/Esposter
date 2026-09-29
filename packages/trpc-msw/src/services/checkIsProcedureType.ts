import type { TRPCProcedureType } from "@trpc/server";

const ProcedureTypes = new Set<unknown>(["mutation", "query", "subscription"] satisfies TRPCProcedureType[]);

export const checkIsProcedureType = (value: unknown): value is TRPCProcedureType => ProcedureTypes.has(value);
