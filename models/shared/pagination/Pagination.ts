import type { SortItem } from "@/models/shared/pagination/SortItem";
import { createSortItemSchema } from "@/models/shared/pagination/SortItem";
import { DEFAULT_READ_LIMIT, MAX_READ_LIMIT } from "@/services/shared/pagination/constants";
import { z } from "zod";

export interface Pagination<TSortKey extends string> {
  cursor?: string | null;
  limit?: number;
  sortBy?: SortItem<TSortKey>[];
}

export const createPaginationSchema = <TSortKeySchema extends z.ZodType<string>>(schema: TSortKeySchema) =>
  z.object({
    cursor: z.string().nullable().default(null),
    limit: z.number().int().min(1).max(MAX_READ_LIMIT).default(DEFAULT_READ_LIMIT),
    sortBy: z.array(createSortItemSchema(schema)).default([]),
  });
