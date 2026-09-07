import type { BasePaginationParams } from "#shared/models/pagination/BasePaginationParams";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { createBasePaginationParamsSchema } from "#shared/models/pagination/BasePaginationParams";
import { z } from "zod";

export interface CursorPaginationParams<T extends string> extends BasePaginationParams<T> {
  // Every sort key's cursor, serialised into one string
  cursor: string;
}

export const createCursorPaginationParamsSchema = <T extends z.ZodType<string>>(
  sortKeySchema: T,
  defaultSortBy: [SortItem<z.output<T>>, ...SortItem<z.output<T>>[]],
) =>
  z.object({
    // At least one sort item, since the primary cursor is derived from it
    ...createBasePaginationParamsSchema(sortKeySchema, 1, defaultSortBy).shape,
    cursor: z.string().default(""),
  });
