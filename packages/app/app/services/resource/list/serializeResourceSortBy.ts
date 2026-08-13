import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

export const serializeResourceSortBy = (sortBy: SortItem<keyof ResourceListItem>[]) =>
  sortBy.map(({ key, order }) => `${key}:${order}`).join(",");
