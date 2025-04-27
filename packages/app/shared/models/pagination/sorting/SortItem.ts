import type { SortOrder } from "#shared/models/pagination/sorting/SortOrder";

import { sortOrderSchema } from "#shared/models/pagination/sorting/SortOrder";
import { z } from "zod";

export interface SortItem<T extends string> {
  key: T;
  order: SortOrder;
}

export const createSortItemSchema = <T extends string>(sortKeySchema: z.ZodType<T>) =>
  z.interface({
    key: sortKeySchema,
    order: sortOrderSchema,
  });
