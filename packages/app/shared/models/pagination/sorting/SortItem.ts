import type { SortOrder } from "#shared/models/pagination/sorting/SortOrder";

import { sortOrderSchema } from "#shared/models/pagination/sorting/SortOrder";
import { z } from "zod/v4";

export interface SortItem<T extends string> {
  key: T;
  order: SortOrder;
}

export const createSortItemSchema = <T extends string>(sortKeySchema: z.ZodType<T>) =>
  z.object({
    key: sortKeySchema,
    order: sortOrderSchema,
  });
