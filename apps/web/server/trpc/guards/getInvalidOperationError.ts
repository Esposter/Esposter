import type { Operation } from "@esposter/shared";

import { InvalidOperationError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getInvalidOperationError = (
  operation: Operation,
  name: string,
  context: string,
  code: TRPCError["code"] = "BAD_REQUEST",
): TRPCError => new TRPCError({ code, message: new InvalidOperationError(operation, name, context).message });
