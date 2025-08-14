import { z } from "zod";

export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}

export const sortOrderSchema = z.enum(SortOrder) satisfies z.ZodType<SortOrder>;
