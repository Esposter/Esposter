import type { SortOrder } from "#shared/models/pagination/sorting/SortOrder";

import { sortOrderSchema } from "#shared/models/pagination/sorting/SortOrder";
import { type } from "arktype";

export interface SortItem<T extends string> {
  key: T;
  order: SortOrder;
}

export const createSortItemSchema = <T extends string>(sortKeySchema: type.Any<T>) =>
  type({
    key: sortKeySchema,
    order: sortOrderSchema,
  }) as type.Any<SortItem<T>>;
