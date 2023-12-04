import { z } from "zod";

export enum SortOrder {
  Asc = "Asc",
  Desc = "Desc",
}

export const sortOrderSchema = z.nativeEnum(SortOrder) satisfies z.ZodType<SortOrder>;
