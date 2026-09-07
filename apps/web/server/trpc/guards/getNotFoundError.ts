import { NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getNotFoundError = (name: string, id: string): TRPCError =>
  new TRPCError({ code: "NOT_FOUND", message: new NotFoundError(name, id).message });
