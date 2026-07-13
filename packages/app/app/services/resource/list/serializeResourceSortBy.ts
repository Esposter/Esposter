import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Resource } from "@esposter/db-schema";

export const serializeResourceSortBy = (sortBy: SortItem<keyof Resource>[]) =>
  sortBy.map(({ key, order }) => `${key}:${order}`).join(",");
