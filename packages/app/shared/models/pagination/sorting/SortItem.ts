import type { SortOrder } from "#shared/models/pagination/sorting/SortOrder";

import { sortOrderSchema } from "#shared/models/pagination/sorting/SortOrder";
import { scope } from "arktype";

export interface SortItem<T extends string> {
  key: T;
  order: SortOrder;
}

export const sortItemScope = scope({
  "SortItem<T extends string>": {
    key: "T",
    order: sortOrderSchema,
  },
});
