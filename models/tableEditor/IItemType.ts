import { z } from "zod";

export interface IItemType<T extends string> {
  type: T;
}

export const createIItemTypeSchema = <T extends z.ZodTypeAny = z.ZodType<string>>(schema: T) =>
  z.object({ type: schema });
