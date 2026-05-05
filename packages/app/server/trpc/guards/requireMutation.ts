import type { Operation } from "@esposter/shared";

import { InvalidOperationError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const requireMutation = <T>(
  result: T | undefined,
  operation: Operation,
  name: string,
  context: string,
  code: "BAD_REQUEST" | "NOT_FOUND" = "BAD_REQUEST",
): T => {
  if (!result)
    throw new TRPCError({
      code,
      message: new InvalidOperationError(operation, name, context).message,
    });
  return result;
};
