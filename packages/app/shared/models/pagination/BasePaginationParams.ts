import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { createSortItemSchema } from "#shared/models/pagination/sorting/SortItem";
import { DEFAULT_READ_LIMIT, MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { z } from "zod";

export interface BasePaginationParams<TSortKey extends string> {
  limit?: number;
  sortBy?: SortItem<TSortKey>[];
}

export const createBasePaginationParamsSchema = <TSortKey extends string>(
  sortKeySchema: z.ZodType<TSortKey>,
  minSortBy = 0,
  defaultSortBy: SortItem<TSortKey>[] = [],
) =>
  z.interface({
    limit: z.int().min(1).max(MAX_READ_LIMIT).default(DEFAULT_READ_LIMIT),
    sortBy: createSortItemSchema(sortKeySchema).array().min(minSortBy).default(defaultSortBy),
  });
