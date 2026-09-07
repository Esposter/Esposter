import { getNotFoundError } from "@@/server/trpc/guards/getNotFoundError";

export const requireEntity = async <T>(query: Promise<null | T | undefined>, name: string, id: string): Promise<T> => {
  const entity = await query;
  if (entity === null || entity === undefined) throw getNotFoundError(name, id);
  return entity;
};
