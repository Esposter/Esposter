import type { BasePaginationParams } from "#shared/models/pagination/BasePaginationParams";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { createBasePaginationParamsSchema } from "#shared/models/pagination/BasePaginationParams";
import { z } from "zod";

export interface CursorPaginationParams<TSortKey extends string> extends BasePaginationParams<TSortKey> {
  // This will be a serialised string of all the cursors based on sorting
  cursor?: string;
}

export const createCursorPaginationParamsSchema = <TSortKeySchema extends z.ZodType<string>>(
  sortKeySchema: TSortKeySchema,
  defaultSortBy: SortItem<TSortKeySchema["_type"]>[],
) =>
  // We need at least one sort item so we can derive a primary cursor for pagination
  createBasePaginationParamsSchema(sortKeySchema, 1, defaultSortBy).merge(
    z.object({
      cursor: z.string().optional(),
    }),
  );
