import { ForbiddenError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getForbiddenError = (reason: string): TRPCError =>
  new TRPCError({ code: "FORBIDDEN", message: new ForbiddenError(reason).message });
