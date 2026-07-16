import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Resource } from "@esposter/db-schema";

import { sortOrderSchema } from "#shared/models/pagination/sorting/SortOrder";
import { selectResourceSchema } from "@esposter/db-schema";

const resourceSortKeySchema = selectResourceSchema.keyof();
// Invalid entries are dropped rather than failing the whole deep link
export const deserializeResourceSortBy = (value: string): SortItem<keyof Resource>[] =>
  value.split(",").flatMap((sortItemValue) => {
    const [key, order] = sortItemValue.split(":");
    const parsedKey = resourceSortKeySchema.safeParse(key);
    const parsedOrder = sortOrderSchema.safeParse(order);
    return parsedKey.success && parsedOrder.success ? [{ key: parsedKey.data, order: parsedOrder.data }] : [];
  });
