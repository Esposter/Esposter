import type { Operation } from "@esposter/shared";

import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";

export const requireMutation = <T>(
  result: T | undefined,
  operation: Operation,
  name: string,
  context: string,
  code: "BAD_REQUEST" | "NOT_FOUND" = "BAD_REQUEST",
): T => {
  if (result === undefined) throw getInvalidOperationError(operation, name, context, code);
  return result;
};
