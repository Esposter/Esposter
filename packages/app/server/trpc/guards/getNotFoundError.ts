import { NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// The counterpart to getInvalidOperationError for a read that found nothing — a missing entity is always a
// NOT_FOUND, so the code is not a caller's to choose
export const getNotFoundError = (name: string, id: string): TRPCError =>
  new TRPCError({ code: "NOT_FOUND", message: new NotFoundError(name, id).message });
