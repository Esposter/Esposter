import type { TRPCProcedureType } from "@trpc/server";

const PROCEDURE_TYPES = new Set<unknown>(["mutation", "query", "subscription"] satisfies TRPCProcedureType[]);

export const checkIsProcedureType = (value: unknown): value is TRPCProcedureType => PROCEDURE_TYPES.has(value);
