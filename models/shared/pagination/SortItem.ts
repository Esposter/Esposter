import type { SortOrder } from "@/models/shared/pagination/SortOrder";
import { sortOrderSchema } from "@/models/shared/pagination/SortOrder";
import { z } from "zod";

export interface SortItem<T extends string> {
  key: T;
  order: SortOrder;
}

export const createSortItemSchema = <T extends z.ZodType<string>>(sortKeySchema: T) =>
  z.object({
    key: sortKeySchema,
    order: sortOrderSchema,
  });
