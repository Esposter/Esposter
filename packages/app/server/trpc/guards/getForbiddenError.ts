import { ForbiddenError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// The third of the pair with getInvalidOperationError/getNotFoundError — a refused action is always a
// FORBIDDEN, so the code is not a caller's to choose either
export const getForbiddenError = (reason: string): TRPCError =>
  new TRPCError({ code: "FORBIDDEN", message: new ForbiddenError(reason).message });
