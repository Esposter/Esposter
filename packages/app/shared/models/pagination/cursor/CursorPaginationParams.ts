import type { BasePaginationParams } from "#shared/models/pagination/BasePaginationParams";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { createBasePaginationParamsSchema } from "#shared/models/pagination/BasePaginationParams";
import { z } from "zod";

export interface CursorPaginationParams<T extends string> extends BasePaginationParams<T> {
  // This will be a serialised string of all the cursors based on sorting
  cursor?: string;
}

export const createCursorPaginationParamsSchema = <T extends z.ZodType<string>>(
  sortKeySchema: T,
  defaultSortBy: SortItem<z.output<T>>[],
) =>
  z.object({
    // We need at least one sort item so we can derive a primary cursor for pagination
    ...createBasePaginationParamsSchema(sortKeySchema, 1, defaultSortBy).shape,
    cursor: z.string().optional(),
  });
