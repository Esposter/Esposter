import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Resource } from "@esposter/db-schema";

export interface ReadResourcesOptions {
  itemsPerPage: number;
  page: number;
  sortBy: SortItem<keyof Resource>[];
}
