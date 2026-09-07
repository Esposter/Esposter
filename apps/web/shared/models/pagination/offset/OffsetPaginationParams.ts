import type { BasePaginationParams } from "#shared/models/pagination/BasePaginationParams";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { createBasePaginationParamsSchema } from "#shared/models/pagination/BasePaginationParams";
import { z } from "zod";

export interface OffsetPaginationParams<T extends string> extends BasePaginationParams<T> {
  offset?: number;
}

export const createOffsetPaginationParamsSchema = <T extends z.ZodType<string>>(
  sortKeySchema: T,
  defaultSortBy: SortItem<z.output<T>>[] = [],
) =>
  z.object({
    ...createBasePaginationParamsSchema(sortKeySchema, 0, defaultSortBy).shape,
    offset: z.int().nonnegative().default(0),
  });
