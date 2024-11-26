import type { SortItem } from "@/shared/models/pagination/sorting/SortItem";

import { createSortItemSchema } from "@/shared/models/pagination/sorting/SortItem";
import { DEFAULT_READ_LIMIT, MAX_READ_LIMIT } from "@/shared/services/pagination/constants";
import { z } from "zod";

export interface BasePaginationParams<TSortKey extends string> {
  limit?: number;
  sortBy?: SortItem<TSortKey>[];
}

export const createBasePaginationParamsSchema = <TSortKeySchema extends z.ZodType<string>>(
  sortKeySchema: TSortKeySchema,
  minSortBy = 0,
  defaultSortBy: SortItem<TSortKeySchema["_type"]>[] = [],
) =>
  z.object({
    limit: z.number().int().min(1).max(MAX_READ_LIMIT).default(DEFAULT_READ_LIMIT),
    sortBy: z.array(createSortItemSchema(sortKeySchema)).min(minSortBy).default(defaultSortBy),
  });
