import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { resourceListSortKeySchema } from "#shared/models/resource/ResourceListSortKey";
import { RESOURCE_SORT_BY_SEPARATOR } from "#src/services/resource/list/constants";
import { sortOrderSchema } from "@esposter/db-schema";

// Invalid entries are dropped rather than failing the whole deep link
export const deserializeResourceSortBy = (value: string): SortItem<keyof ResourceListItem>[] =>
  value.split(",").flatMap((sortItemValue) => {
    const [key, order] = sortItemValue.split(RESOURCE_SORT_BY_SEPARATOR);
    const parsedKey = resourceListSortKeySchema.safeParse(key);
    const parsedOrder = sortOrderSchema.safeParse(order);
    return parsedKey.success && parsedOrder.success ? [{ key: parsedKey.data, order: parsedOrder.data }] : [];
  });
