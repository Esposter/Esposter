import type { Operation } from "@esposter/shared";

import { InvalidOperationError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// A rejected mutation reads the same whether a guard caught it or the router asserted it itself, so the
// Code and the message are paired in one place rather than at every throw site
export const getInvalidOperationError = (
  operation: Operation,
  name: string,
  context: string,
  code: TRPCError["code"] = "BAD_REQUEST",
): TRPCError => new TRPCError({ code, message: new InvalidOperationError(operation, name, context).message });
