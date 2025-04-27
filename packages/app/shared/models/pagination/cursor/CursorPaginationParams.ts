import type { BasePaginationParams } from "#shared/models/pagination/BasePaginationParams";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { createBasePaginationParamsSchema } from "#shared/models/pagination/BasePaginationParams";
import { z } from "zod";

export interface CursorPaginationParams<TSortKey extends string> extends BasePaginationParams<TSortKey> {
  // This will be a serialised string of all the cursors based on sorting
  cursor?: string;
}

export const createCursorPaginationParamsSchema = <TSortKey extends string>(
  sortKeySchema: z.ZodType<TSortKey>,
  defaultSortBy: SortItem<TSortKey>[],
) =>
  // We need at least one sort item so we can derive a primary cursor for pagination
  createBasePaginationParamsSchema(sortKeySchema, 1, defaultSortBy).merge(
    z.object({
      cursor: z.string().optional(),
    }),
  );
