import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { RESOURCE_SORT_BY_SEPARATOR } from "@/services/resource/list/constants";

export const serializeResourceSortBy = (sortBy: SortItem<keyof ResourceListItem>[]) =>
  sortBy.map(({ key, order }) => `${key}${RESOURCE_SORT_BY_SEPARATOR}${order}`).join(",");
