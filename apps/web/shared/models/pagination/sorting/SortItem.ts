import type { SortOrder } from "#shared/models/pagination/sorting/SortOrder";

import { sortOrderSchema } from "#shared/models/pagination/sorting/SortOrder";
import { z } from "zod";

export interface SortItem<T extends string> {
  isIncludeValue?: true;
  key: T;
  order: SortOrder;
}

export const createSortItemSchema = <T extends z.ZodType<string>>(sortKeySchema: T) =>
  z.object({
    isIncludeValue: z.literal(true).optional(),
    key: sortKeySchema,
    order: sortOrderSchema,
  });
