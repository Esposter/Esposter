import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { sortOrderSchema } from "#shared/models/pagination/sorting/SortOrder";
import { resourceListSortKeySchema } from "#shared/models/resource/ResourceListItem";
import { RESOURCE_SORT_BY_SEPARATOR } from "@/services/resource/list/constants";

// Invalid entries are dropped rather than failing the whole deep link
export const deserializeResourceSortBy = (value: string): SortItem<keyof ResourceListItem>[] =>
  value.split(",").flatMap((sortItemValue) => {
    const [key, order] = sortItemValue.split(RESOURCE_SORT_BY_SEPARATOR);
    const parsedKey = resourceListSortKeySchema.safeParse(key);
    const parsedOrder = sortOrderSchema.safeParse(order);
    return parsedKey.success && parsedOrder.success ? [{ key: parsedKey.data, order: parsedOrder.data }] : [];
  });
