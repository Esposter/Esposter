import { createSortItemSchema, type SortItem } from "@/models/shared/pagination/SortItem";
import { DEFAULT_READ_LIMIT, MAX_READ_LIMIT } from "@/services/shared/pagination/constants";
import { z } from "zod";

export interface CommonPaginationParams<TSortKey extends string> {
  limit?: number;
  sortBy?: SortItem<TSortKey>[];
}

export const createCommonPaginationParamsSchema = <TSortKeySchema extends z.ZodType<string>>(
  sortKeySchema: TSortKeySchema,
) =>
  z.object({
    limit: z.number().int().min(1).max(MAX_READ_LIMIT).default(DEFAULT_READ_LIMIT),
    sortBy: z.array(createSortItemSchema(sortKeySchema)).default([]),
  });
