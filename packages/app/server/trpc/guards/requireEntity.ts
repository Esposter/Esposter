import { NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const requireEntity = async <T>(query: Promise<null | T | undefined>, name: string, id: string): Promise<T> => {
  const entity = await query;
  if (!entity) throw new TRPCError({ code: "NOT_FOUND", message: new NotFoundError(name, id).message });
  return entity;
};
