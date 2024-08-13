import type { BasePaginationParams } from "@/models/shared/pagination/BasePaginationParams";
import type { SortItem } from "@/models/shared/pagination/sorting/SortItem";

import { createBasePaginationParamsSchema } from "@/models/shared/pagination/BasePaginationParams";
import { z } from "zod";

export interface CursorPaginationParams<TSortKey extends string> extends BasePaginationParams<TSortKey> {
  // This will be a serialised string of all the cursors based on sorting
  cursor?: null | string;
}

export const createCursorPaginationParamsSchema = <TSortKeySchema extends z.ZodType<string>>(
  sortKeySchema: TSortKeySchema,
  defaultSortBy: SortItem<TSortKeySchema["_type"]>[],
) =>
  // We need at least one sort item so we can derive a primary cursor for pagination
  createBasePaginationParamsSchema(sortKeySchema, 1, defaultSortBy).merge(
    z.object({
      cursor: z.string().nullable().default(null),
    }),
  );
